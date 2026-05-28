<?php

namespace App\Modules\ATS\Controllers;

use App\Modules\ATS\Models\JobPosting;
use App\Modules\ATS\Services\JobApplicationService;
use App\Modules\Shared\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicJobController extends BaseController
{
    public function __construct(protected JobApplicationService $applicationService)
    {
    }

    public function show(string $slug): JsonResponse
    {
        $job = JobPosting::withoutGlobalScopes()
            ->where('public_slug', $slug)
            ->where('status', 'published')
            ->first();

        if (!$job) {
            return $this->error('This job is not available.', 404);
        }

        return $this->success([
            'title' => $job->title,
            'description' => $job->description,
            'department' => $job->department,
            'location' => $job->location,
            'employment_type' => $job->employment_type,
            'company' => \App\Modules\Tenant\Models\Tenant::find($job->tenant_id)?->name,
        ]);
    }

    public function apply(Request $request, string $slug): JsonResponse
    {
        $job = JobPosting::withoutGlobalScopes()
            ->where('public_slug', $slug)
            ->where('status', 'published')
            ->with('creator')
            ->first();

        if (!$job) {
            return $this->error('This job is not available.', 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:50',
            'resume' => 'required|file|mimes:pdf,doc,docx|max:5120',
        ]);

        $candidate = $this->applicationService->apply($job, $validated, $request->file('resume'));

        return $this->success([
            'message' => 'Application submitted successfully.',
            'candidate_id' => $candidate->id,
        ], 'Thank you for applying!', 201);
    }

    public function showOffer(string $token): JsonResponse
    {
        $candidate = \App\Modules\ATS\Models\Candidate::withoutGlobalScopes()
            ->where('offer_token', $token)
            ->with(['jobPosting', 'department', 'designation'])
            ->first();

        if (!$candidate) {
            return $this->error('This offer is invalid or has expired.', 404);
        }

        $tenant = \App\Modules\Tenant\Models\Tenant::find($candidate->tenant_id);

        return $this->success([
            'candidate' => [
                'name' => $candidate->name,
                'email' => $candidate->email,
                'phone' => $candidate->phone,
                'joining_date' => $candidate->joining_date,
                'employment_type' => $candidate->employment_type,
                'offered_salary' => $candidate->offered_salary,
                'offer_accepted_at' => $candidate->offer_accepted_at,
                'offer_declined_at' => $candidate->offer_declined_at,
            ],
            'job' => [
                'title' => $candidate->jobPosting?->title,
                'department' => $candidate->department?->name,
                'designation' => $candidate->designation?->name,
            ],
            'company' => $tenant?->name,
        ]);
    }

    public function acceptOffer(Request $request, string $token): JsonResponse
    {
        $candidate = \App\Modules\ATS\Models\Candidate::withoutGlobalScopes()
            ->where('offer_token', $token)
            ->first();

        if (!$candidate) {
            return $this->error('This offer is invalid or has expired.', 404);
        }

        if ($candidate->offer_accepted_at) {
            return $this->error('This offer has already been accepted.', 400);
        }

        $tenant = \App\Modules\Tenant\Models\Tenant::find($candidate->tenant_id);
        
        app(\App\Modules\Core\Tenancy\TenantManager::class)->setTenant($tenant);

        $candidate->update([
            'offer_accepted_at' => now(),
            'current_stage' => 'Hired',
        ]);

        $employeeService = app(\App\Modules\Employee\Services\EmployeeService::class);
        $randomPassword = \Illuminate\Support\Str::random(12);

        $employee = $employeeService->create([
            'name' => $candidate->name,
            'email' => $candidate->email,
            'phone' => $candidate->phone,
            'department_id' => $candidate->department_id,
            'designation_id' => $candidate->designation_id,
            'joining_date' => $candidate->joining_date,
            'manager_id' => $candidate->manager_id,
            'employment_type' => $candidate->employment_type ?? 'full-time',
            'create_user_account' => true,
            'password' => $randomPassword,
            'status' => 'active',
        ]);

        $activityService = app(\App\Modules\ATS\Services\CandidateActivityService::class);
        $activityService->log(
            $candidate,
            'offer_accepted',
            "Employment offer accepted by {$candidate->name}. Onboarded as employee ID: {$employee->employee_id}.",
            ['employee_id' => $employee->id]
        );

        $notificationService = app(\App\Modules\Notification\Services\NotificationService::class);
        $creator = $candidate->jobPosting?->creator ?? \App\Models\User::first();

        if ($candidate->manager && $candidate->manager->user) {
            $notificationService->send(
                $candidate->manager->user,
                'offer_accepted',
                'Employment Offer Accepted',
                "{$candidate->name} has accepted the offer and is joining your team on {$candidate->joining_date}!",
                'ats',
                'high',
                ['candidate_id' => $candidate->id, 'employee_id' => $employee->id]
            );
        }

        if ($creator) {
            $notificationService->send(
                $creator,
                'offer_accepted',
                'Offer Accepted & Onboarded',
                "Candidate {$candidate->name} has accepted their offer and been successfully onboarded as employee {$employee->name} ({$employee->employee_id}).",
                'ats',
                'high',
                ['candidate_id' => $candidate->id, 'employee_id' => $employee->id]
            );
        }

        return $this->success([
            'message' => 'Offer accepted successfully. Welcome to the team!',
            'employee_id' => $employee->employee_id,
            'work_email' => $employee->work_email,
        ]);
    }

    public function declineOffer(Request $request, string $token): JsonResponse
    {
        $candidate = \App\Modules\ATS\Models\Candidate::withoutGlobalScopes()
            ->where('offer_token', $token)
            ->first();

        if (!$candidate) {
            return $this->error('This offer is invalid or has expired.', 404);
        }

        if ($candidate->offer_accepted_at || $candidate->offer_declined_at) {
            return $this->error('This offer has already been responded to.', 400);
        }

        $tenant = \App\Modules\Tenant\Models\Tenant::find($candidate->tenant_id);
        app(\App\Modules\Core\Tenancy\TenantManager::class)->setTenant($tenant);

        $candidate->update([
            'offer_declined_at' => now(),
            'current_stage' => 'Rejected',
        ]);

        $activityService = app(\App\Modules\ATS\Services\CandidateActivityService::class);
        $activityService->log(
            $candidate,
            'offer_declined',
            "Employment offer declined by {$candidate->name}.",
            []
        );

        $notificationService = app(\App\Modules\Notification\Services\NotificationService::class);
        $creator = $candidate->jobPosting?->creator ?? \App\Models\User::first();

        if ($candidate->manager && $candidate->manager->user) {
            $notificationService->send(
                $candidate->manager->user,
                'offer_declined',
                'Employment Offer Declined',
                "{$candidate->name} has declined the offer of employment.",
                'ats',
                'high',
                ['candidate_id' => $candidate->id]
            );
        }

        if ($creator) {
            $notificationService->send(
                $creator,
                'offer_declined',
                'Offer Declined',
                "Candidate {$candidate->name} has declined the employment offer.",
                'ats',
                'high',
                ['candidate_id' => $candidate->id]
            );
        }

        return $this->success([
            'message' => 'Offer declined. Thank you for your response.',
        ]);
    }
}
