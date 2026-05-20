<?php

namespace App\Modules\Tenant\Controllers;

use App\Modules\Shared\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TenantSettingsController extends BaseController
{
    public function show(): JsonResponse
    {
        $tenant = Auth::user()->tenant;
        return $this->success([
            'name' => $tenant->name,
            'subdomain' => $tenant->subdomain,
            'timezone' => $tenant->timezone,
            'logo' => $tenant->logo,
            'settings' => $tenant->settings ?? [],
            'branding' => $tenant->branding ?? [],
            'onboarding_completed_at' => $tenant->onboarding_completed_at,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $tenant = Auth::user()->tenant;

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'timezone' => 'sometimes|string',
            'logo' => 'nullable|string',
            'settings' => 'nullable|array',
            'branding' => 'nullable|array',
            'branding.primary_color' => 'nullable|string',
            'branding.accent_color' => 'nullable|string',
            'branding.company_tagline' => 'nullable|string',
        ]);

        $tenant->update($validated);

        return $this->success($tenant->fresh(), 'Tenant settings updated');
    }
}
