<?php

namespace App\Modules\Core\Tenancy\Traits;

use App\Modules\Core\Tenancy\TenantManager;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant()
    {
        static::creating(function ($model) {
            $tenantManager = app(TenantManager::class);
            if ($tenantManager->hasTenant() && !isset($model->tenant_id)) {
                $model->tenant_id = $tenantManager->getTenantId();
            }
        });

        static::addGlobalScope('tenant', function (Builder $builder) {
            $tenantManager = app(TenantManager::class);
            if ($tenantManager->hasTenant()) {
                $builder->where('tenant_id', $tenantManager->getTenantId());
            }
        });
    }
}
