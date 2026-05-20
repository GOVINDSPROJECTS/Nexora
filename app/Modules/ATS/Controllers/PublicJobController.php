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
}
