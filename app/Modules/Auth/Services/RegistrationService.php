<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use App\Modules\Tenant\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Modules\Auth\Constants\Permissions;

class RegistrationService
{
    /**
     * Register a new tenant and its first admin user.
     */
    public function registerTenant(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // 1. Create Tenant
            $tenant = Tenant::create([
                'name' => $data['company_name'],
                'subdomain' => $data['subdomain'] ?? null,
                'contact_email' => $data['email'],
                'timezone' => $data['timezone'] ?? 'UTC',
            ]);

            // 2. Create Admin User
            $user = User::create([
                'tenant_id' => $tenant->id,
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'status' => 'active',
            ]);

            // 3. Assign Tenant Admin Role
            $user->assignRole(Permissions::ROLE_TENANT_ADMIN);

            // 4. Assign Free Subscription Plan
            $freePlan = \App\Modules\Tenant\Models\SubscriptionPlan::where('slug', 'free')->first();
            if ($freePlan) {
                \App\Modules\Tenant\Models\TenantSubscription::create([
                    'tenant_id' => $tenant->id,
                    'plan_id' => $freePlan->id,
                    'status' => 'active',
                ]);
            }

            return [
                'user' => $user,
                'tenant' => $tenant,
            ];
        });
    }
}
