<?php

namespace App\Modules\Employee\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantId = app(\App\Modules\Core\Tenancy\TenantManager::class)->getTenantId();

        return [
            'name'            => ['required', 'string', 'max:255'],
            'email'           => [
                'nullable',
                'email',
                \Illuminate\Validation\Rule::unique('employees', 'email')
                    ->where('tenant_id', $tenantId)
                    ->ignore($this->route('employee')),
            ],
            'work_email'      => ['nullable', 'email'],
            'employee_id'     => [
                'nullable', 
                'string', 
                \Illuminate\Validation\Rule::unique('employees')
                    ->where('tenant_id', $tenantId)
                    ->ignore($this->employee)
            ],
            'department_id'   => ['nullable', 'exists:departments,id'],
            'designation_id'  => ['nullable', 'exists:designations,id'],
            'joining_date'    => ['nullable', 'date'],
            'manager_id'      => ['nullable', 'exists:employees,id'],
            'employment_type'     => ['nullable', 'string', 'in:full-time,part-time,contract'],
            'status'              => ['nullable', 'string', 'in:active,inactive,onboarding'],
            'create_user_account' => ['nullable', 'boolean'],
            'password'            => ['nullable', 'string', 'min:8'],
            'role'                => ['nullable', 'string', 'exists:roles,name'],
        ];
    }
}
