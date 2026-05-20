<?php

namespace App\Modules\Tenant\Controllers;

use App\Modules\Shared\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OnboardingController extends BaseController
{
    public function status(): JsonResponse
    {
        $tenant = Auth::user()->tenant;
        $settings = $tenant->settings ?? [];

        $steps = [
            'company_profile' => !empty($tenant->name) && !empty($tenant->contact_email),
            'branding' => !empty($tenant->branding),
            'first_employee' => \App\Modules\Employee\Models\Employee::count() > 0,
            'leave_types' => \App\Modules\Leave\Models\LeaveType::count() > 0,
            'first_job' => \App\Modules\ATS\Models\JobPosting::count() > 0,
        ];

        $completed = count(array_filter($steps));
        $total = count($steps);

        return $this->success([
            'steps' => $steps,
            'progress' => round(($completed / $total) * 100),
            'completed' => $tenant->onboarding_completed_at !== null,
            'walkthrough' => $settings['onboarding_walkthrough'] ?? $this->defaultWalkthrough(),
        ]);
    }

    public function completeStep(Request $request): JsonResponse
    {
        $validated = $request->validate(['step' => 'required|string']);

        $tenant = Auth::user()->tenant;
        $settings = $tenant->settings ?? [];
        $settings['onboarding_steps'][$validated['step']] = now()->toIso8601String();
        $tenant->update(['settings' => $settings]);

        return $this->success(null, 'Step recorded');
    }

    public function complete(): JsonResponse
    {
        Auth::user()->tenant->update(['onboarding_completed_at' => now()]);
        return $this->success(null, 'Onboarding completed');
    }

    protected function defaultWalkthrough(): array
    {
        return [
            ['id' => 'welcome', 'title' => 'Welcome to Nexora', 'description' => 'Set up your company workspace in minutes.'],
            ['id' => 'employees', 'title' => 'Add your team', 'description' => 'Import or create employee profiles.'],
            ['id' => 'leave', 'title' => 'Configure leave', 'description' => 'Set leave types and approval flows.'],
            ['id' => 'hiring', 'title' => 'Start hiring', 'description' => 'Post jobs and manage your candidate pipeline.'],
            ['id' => 'automation', 'title' => 'Enable automation', 'description' => 'Reduce manual work with smart workflows.'],
        ];
    }
}
