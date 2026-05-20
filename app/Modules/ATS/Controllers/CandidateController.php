<?php

namespace App\Modules\ATS\Controllers;

use App\Modules\ATS\Models\Candidate;
use App\Modules\ATS\Models\JobPosting;
use App\Modules\ATS\Resources\CandidateResource;
use App\Modules\ATS\Services\CandidateActivityService;
use App\Modules\Automation\Events\CandidateSelected;
use App\Modules\Shared\Controllers\BaseController;
use App\Modules\Shared\Traits\PaginatesApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CandidateController extends BaseController
{
    use PaginatesApiResponses;

    public function __construct(protected CandidateActivityService $activityService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Candidate::with(['jobPosting', 'interviews.interviewer'])
            ->when($request->stage, fn ($q) => $q->where('current_stage', $request->stage))
            ->when($request->job_posting_id, fn ($q) => $q->where('job_posting_id', $request->job_posting_id))
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($sq) use ($request) {
                    $sq->where('name', 'like', "%{$request->search}%")
                        ->orWhere('email', 'like', "%{$request->search}%");
                });
            })
            ->latest();

        if ($request->boolean('all')) {
            return $this->success(CandidateResource::collection($query->get()));
        }

        return $this->paginated($query, CandidateResource::class, $request);
    }

    public function show(int $id): JsonResponse
    {
        $candidate = Candidate::with(['jobPosting', 'interviews.interviewer', 'activities.user'])
            ->findOrFail($id);

        return $this->success(new CandidateResource($candidate));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'job_posting_id' => 'required|exists:job_postings,id',
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'current_stage' => 'nullable|string',
        ]);

        $candidate = Candidate::create(array_merge($validated, [
            'status' => 'active',
            'current_stage' => $validated['current_stage'] ?? 'Applied',
        ]));

        $this->activityService->log($candidate, 'created', 'Candidate added to pipeline');

        return $this->success(new CandidateResource($candidate->load('jobPosting')), 'Candidate created successfully', 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $candidate = Candidate::findOrFail($id);
        $previousStage = $candidate->current_stage;

        $validated = $request->validate([
            'status' => 'sometimes|string',
            'current_stage' => 'sometimes|string',
            'rating' => 'sometimes|integer|min:1|max:5',
        ]);

        $candidate->update($validated);

        if (isset($validated['current_stage']) && $validated['current_stage'] !== $previousStage) {
            $this->activityService->logStageChange($candidate, $previousStage, $validated['current_stage']);

            if ($validated['current_stage'] === 'Selected') {
                event(new CandidateSelected($candidate));
            }
        }

        return $this->success(new CandidateResource($candidate->load('jobPosting', 'interviews')), 'Candidate updated successfully');
    }

    public function uploadResume(Request $request, $id): JsonResponse
    {
        $candidate = Candidate::findOrFail($id);

        $request->validate([
            'resume' => 'required|file|mimes:pdf,doc,docx|max:5120',
        ]);

        if ($request->hasFile('resume')) {
            $path = $request->file('resume')->store('resumes', 'public');
            $candidate->update(['resume_path' => $path]);
            $this->activityService->log($candidate, 'resume_uploaded', 'Resume uploaded');

            return $this->success(['resume_path' => asset('storage/' . $path)], 'Resume uploaded successfully');
        }

        return $this->error('No file provided', 400);
    }

    public function addNote(Request $request, int $id): JsonResponse
    {
        $candidate = Candidate::findOrFail($id);
        $validated = $request->validate(['note' => 'required|string|max:5000']);

        $activity = $this->activityService->addNote($candidate, $validated['note']);

        return $this->success($activity, 'Note added', 201);
    }

    public function activities(int $id): JsonResponse
    {
        $candidate = Candidate::findOrFail($id);
        $activities = $candidate->activities()->with('user')->latest()->paginate(20);

        return $this->success($activities);
    }

    public function pipelineSummary(): JsonResponse
    {
        $stages = ['Applied', 'Screening', 'Technical Round', 'HR Round', 'Final Round', 'Selected', 'Rejected'];
        $summary = collect($stages)->mapWithKeys(function ($stage) {
            return [$stage => Candidate::where('current_stage', $stage)->count()];
        });

        return $this->success($summary);
    }
}
