<?php

namespace App\Modules\Core\Tenancy\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Modules\Core\Tenancy\TenantManager;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
{
    public function __construct(protected TenantManager $tenantManager)
    {
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Identify by Header (e.g., X-Tenant-ID)
        $tenantId = $request->header('X-Tenant-ID');

        // 2. Identify by Subdomain (Fallback)
        if (!$tenantId) {
            $host = $request->getHost();
            $parts = explode('.', $host);
            if (count($parts) > 2) {
                $subdomain = $parts[0];
                // In a real app, we'd lookup the tenant by subdomain in the DB
                // $tenant = Tenant::where('subdomain', $subdomain)->first();
            }
        }

        // For Phase 0, we'll just simulate identification if header is present
        if ($tenantId) {
            // $tenant = Tenant::find($tenantId);
            // $this->tenantManager->setTenant($tenant);
        }

        return $next($request);
    }
}
