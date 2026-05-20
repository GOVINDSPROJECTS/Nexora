<?php

namespace App\Modules\Core\Tenancy;

use Illuminate\Support\Facades\Config;

class TenantManager
{
    protected ?object $tenant = null;

    /**
     * Set the current tenant
     */
    public function setTenant(object $tenant): void
    {
        $this->tenant = $tenant;
        
        // Update app config or connections if needed
        Config::set('app.tenant_id', $tenant->id);
    }

    /**
     * Get the current tenant
     */
    public function getTenant(): ?object
    {
        return $this->tenant;
    }

    /**
     * Check if a tenant is identified
     */
    public function hasTenant(): bool
    {
        return !is_null($this->tenant);
    }

    /**
     * Get the tenant ID
     */
    public function getTenantId(): ?int
    {
        return $this->tenant?->id;
    }
}
