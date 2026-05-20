<?php

namespace App\Modules\Employee\Services;

use App\Modules\Tenant\Models\Tenant;
use Illuminate\Support\Str;

class EmployeeEmailService
{
    public function resolveWorkEmail(string $name, ?string $provided, ?Tenant $tenant = null): string
    {
        if ($provided) {
            return strtolower(trim($provided));
        }

        $tenant = $tenant ?? app(\App\Modules\Core\Tenancy\TenantManager::class)->getTenant();
        $domain = $tenant?->settings['email_domain'] ?? ($tenant?->subdomain . '.nexora.local');

        $local = Str::slug(Str::lower($name), '.');
        $local = preg_replace('/[^a-z0-9.]/', '', $local) ?: 'employee';

        return $local . '@' . ltrim($domain, '@');
    }

    public function resolveLoginEmail(string $workEmail, ?string $provided): string
    {
        return strtolower(trim($provided ?: $workEmail));
    }
}
