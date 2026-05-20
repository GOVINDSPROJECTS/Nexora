<?php

namespace App\Modules\ATS\Controllers;

use App\Modules\ATS\Models\Candidate;
use App\Modules\ATS\Models\JobPosting;
use App\Modules\ATS\Resources\JobResource;
use App\Modules\ATS\Services\JobService;
use App\Modules\Auth\Constants\Permissions;
use App\Modules\Shared\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobController extends BaseController
{
    public function __construct(protected JobService $jobService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorizeJobAccess();

        $jobs = $this->jobService->listForUser(auth()->user())
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->paginate($request->integer('per_page', 15));

        $jobs->getCollection()->transform(function ($job) {
            return $this->formatJob($job);
        });

        return $this->success($jobs);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorizeJobAccess();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'department' => 'nullable|string',
            'location' => 'nullable|string',
            'employment_type' => 'nullable|string|in:full-time,part-time,contract',
            'status' => 'nullable|in:draft,published,closed',
        ]);

        $job = JobPosting::create(array_merge($validated, [
            'created_by' => auth()->id(),
            'public_slug' => $this->jobService->generateSlug($validated['title']),
            'status' => $validated['status'] ?? 'draft',
        ]));

        return $this->success($this->formatJob($job->load('creator')), 'Job posting created', 201);
    }

    public function show(int $id): JsonResponse
    {
        $job = JobPosting::with(['creator:id,name,email'])->withCount('candidates')->findOrFail($id);
        $this->authorizeJobView($job);

        return $this->success($this->formatJob($job));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $job = JobPosting::findOrFail($id);
        $this->authorizeJobManage($job);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'department' => 'nullable|string',
            'location' => 'nullable|string',
            'employment_type' => 'nullable|string|in:full-time,part-time,contract',
            'status' => 'sometimes|in:draft,published,closed',
        ]);

        if (isset($validated['title']) && !$job->public_slug) {
            $job->public_slug = $this->jobService->generateSlug($validated['title']);
        }

        $job->update($validated);

        return $this->success($this->formatJob($job->fresh(['creator'])), 'Job updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $job = JobPosting::findOrFail($id);
        $this->authorizeJobManage($job);
        $job->delete();

        return $this->success(null, 'Job deleted');
    }

    public function candidates(Request $request, int $jobId): JsonResponse
    {
        $job = JobPosting::findOrFail($jobId);
        $this->authorizeJobView($job);

        $candidates = Candidate::with(['interviews'])
            ->where('job_posting_id', $jobId)
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return $this->success($candidates);
    }

    protected function formatJob(JobPosting $job): array
    {
        return [
            'id' => $job->id,
            'title' => $job->title,
            'description' => $job->description,
            'department' => $job->department,
            'location' => $job->location,
            'employment_type' => $job->employment_type,
            'status' => $job->status,
            'public_slug' => $job->public_slug,
            'apply_url' => $job->public_slug ? $this->jobService->applyUrl($job) : null,
            'candidates_count' => $job->candidates_count ?? $job->candidates()->count(),
            'created_by' => $job->created_by,
            'creator' => $job->relationLoaded('creator') ? $job->creator : null,
            'can_manage' => $this->jobService->canManage(auth()->user(), $job),
            'created_at' => $job->created_at?->toIso8601String(),
        ];
    }

    protected function authorizeJobAccess(): void
    {
        if (!auth()->user()->hasRole([Permissions::ROLE_TENANT_ADMIN, Permissions::ROLE_HR])) {
            abort(403, 'Only HR or administrators can manage job postings.');
        }
    }

    protected function authorizeJobView(JobPosting $job): void
    {
        $this->authorizeJobAccess();
        if (!$this->jobService->canView(auth()->user(), $job)) {
            abort(403, 'You cannot view this job posting.');
        }
    }

    protected function authorizeJobManage(JobPosting $job): void
    {
        $this->authorizeJobAccess();
        if (!$this->jobService->canManage(auth()->user(), $job)) {
            abort(403, 'You can only edit jobs you created.');
        }
    }
}
