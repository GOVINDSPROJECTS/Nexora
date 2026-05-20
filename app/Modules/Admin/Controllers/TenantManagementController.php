<?php

namespace App\Modules\Admin\Controllers;

use App\Modules\Shared\Controllers\BaseController;
use App\Modules\Tenant\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantManagementController extends BaseController
{
    /**
     * Get a list of all tenants with their subscription details.
     */
    public function index(): JsonResponse
    {
        $tenants = Tenant::with(['users' => function($q) {
            $q->whereHas('roles', function($r) {
                $r->where('name', 'Tenant Admin');
            });
        }])->withCount('users')->latest()->paginate(20);

        return $this->success($tenants);
    }

    /**
     * Get system-wide metrics.
     */
    public function stats(): JsonResponse
    {
        $totalTenants = Tenant::count();
        $activeTenants = Tenant::whereHas('users')->count();
        $totalUsers = \App\Models\User::count();

        return $this->success([
            'total_tenants' => $totalTenants,
            'active_tenants' => $activeTenants,
            'total_users' => $totalUsers,
            'mrr' => '$0', // To be implemented with billing
        ]);
    }
}
