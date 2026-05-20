<?php

namespace App\Modules\Core\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Modules\Tenant\Models\TenantSubscription;

class CheckFeatureAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $user = $request->user();

        if (!$user || !$user->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Global Super Admin bypass
        if ($user->hasRole('Super Admin')) {
            return $next($request);
        }

        $subscription = TenantSubscription::where('tenant_id', $user->tenant_id)
            ->with('plan')
            ->first();

        if (!$subscription || !$subscription->isActive()) {
            return response()->json(['message' => 'Active subscription required'], 403);
        }

        $features = $subscription->plan->features ?? [];

        if (!in_array($feature, $features)) {
            return response()->json(['message' => "Feature [{$feature}] not included in your current plan."], 403);
        }

        return $next($request);
    }
}
