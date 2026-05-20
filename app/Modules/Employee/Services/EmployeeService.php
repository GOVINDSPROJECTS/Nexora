<?php

namespace App\Modules\Employee\Services;

use App\Modules\Employee\Mail\EmployeeWelcomeMail;
use App\Modules\Employee\Repositories\EmployeeRepository;
use App\Modules\Notification\Services\MailService;
use App\Modules\Shared\Services\BaseService;

class EmployeeService extends BaseService
{
    public function __construct(
        protected EmployeeRepository $repository,
        protected EmployeeEmailService $emailService,
        protected MailService $mailService
    ) {
    }

    public function list(array $filters)
    {
        return $this->repository->search($filters);
    }

    public function create(array $data)
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
            $tenant = app(\App\Modules\Core\Tenancy\TenantManager::class)->getTenant();

            $data['work_email'] = $this->emailService->resolveWorkEmail(
                $data['name'],
                $data['work_email'] ?? null,
                $tenant
            );

            $loginEmail = $this->emailService->resolveLoginEmail($data['work_email'], $data['email'] ?? null);
            $data['email'] = $loginEmail;

            $plainPassword = null;

            if (!empty($data['create_user_account']) && !empty($data['password'])) {
                $plainPassword = $data['password'];
                $user = \App\Models\User::create([
                    'tenant_id' => $tenant?->id ?? app(\App\Modules\Core\Tenancy\TenantManager::class)->getTenantId(),
                    'name' => $data['name'],
                    'email' => $loginEmail,
                    'password' => \Illuminate\Support\Facades\Hash::make($data['password']),
                    'status' => 'active',
                ]);

                if (!empty($data['role'])) {
                    $user->assignRole($data['role']);
                } else {
                    $user->assignRole(\App\Modules\Auth\Constants\Permissions::ROLE_EMPLOYEE);
                }

                $data['user_id'] = $user->id;
            }

            $employee = $this->repository->create($data);

            $this->mailService->send(
                $employee->work_email,
                new EmployeeWelcomeMail($employee, $plainPassword),
                $employee->name
            );

            event(new \App\Modules\Automation\Events\EmployeeCreated($employee));

            return $employee;
        });
    }

    public function update(int $id, array $data)
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($id, $data) {
            $employee = $this->repository->find($id);
            if (!$employee) {
                return false;
            }

            if (isset($data['name']) || isset($data['work_email'])) {
                $data['work_email'] = $this->emailService->resolveWorkEmail(
                    $data['name'] ?? $employee->name,
                    $data['work_email'] ?? $employee->work_email,
                );
            }

            if (!empty($data['create_user_account'])) {
                if (!$employee->user_id && !empty($data['password'])) {
                    $loginEmail = $this->emailService->resolveLoginEmail(
                        $data['work_email'] ?? $employee->work_email,
                        $data['email'] ?? $employee->email
                    );
                    $user = \App\Models\User::create([
                        'tenant_id' => app(\App\Modules\Core\Tenancy\TenantManager::class)->getTenantId(),
                        'name' => $data['name'] ?? $employee->name,
                        'email' => $loginEmail,
                        'password' => \Illuminate\Support\Facades\Hash::make($data['password']),
                        'status' => 'active',
                    ]);
                    $data['user_id'] = $user->id;
                    $data['email'] = $loginEmail;
                    $employee->user_id = $user->id;
                }

                $userToUpdate = $employee->user ?? \App\Models\User::find($data['user_id'] ?? $employee->user_id);
                if ($userToUpdate) {
                    if (!empty($data['role'])) {
                        $userToUpdate->syncRoles([$data['role']]);
                    }

                    if (!empty($data['password'])) {
                        $userToUpdate->update(['password' => \Illuminate\Support\Facades\Hash::make($data['password'])]);
                    }
                }
            }

            return $this->repository->update($id, $data);
        });
    }

    public function delete(int $id)
    {
        return $this->repository->delete($id);
    }

    public function getById(int $id)
    {
        return $this->repository->find($id);
    }
}
