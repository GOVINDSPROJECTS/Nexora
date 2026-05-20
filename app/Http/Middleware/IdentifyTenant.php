<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Modules\Core\Tenancy\TenantManager;
use Illuminate\Support\Facades\Auth;

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
        if (Auth::check() && Auth::user()->tenant) {
            $this->tenantManager->setTenant(Auth::user()->tenant);
        }

        return $next($request);
    }
}
