<?php

namespace App\Modules\ATS\Controllers;

use App\Modules\ATS\Models\Interview;
use App\Modules\ATS\Services\CandidateActivityService;
use App\Modules\Automation\Events\InterviewScheduled;
use App\Modules\ATS\Services\InterviewNotificationService;
use App\Modules\Integration\Services\IntegrationService;
use App\Modules\Shared\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InterviewController extends BaseController
{
    public function __construct(
        protected CandidateActivityService $activityService,
        protected IntegrationService $integrationService,
        protected InterviewNotificationService $interviewNotifications
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $interviews = Interview::with(['candidate', 'jobPosting', 'interviewer'])
            ->when($request->candidate_id, fn ($q) => $q->where('candidate_id', $request->candidate_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy('scheduled_at')
            ->paginate($request->integer('per_page', 15));

        return $this->success($interviews);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'candidate_id' => 'required|exists:candidates,id',
            'job_posting_id' => 'required|exists:job_postings,id',
            'interviewer_id' => 'nullable|exists:users,id',
            'stage' => 'required|string',
            'scheduled_at' => 'required|date',
        ]);

        $title = 'Interview: ' . $validated['stage'];
        $validated['meeting_link'] = $this->integrationService->generateMeeting($title, $validated['scheduled_at']);
        $calendarEvent = $this->integrationService->syncCalendarEvent($title, $validated['scheduled_at']);

        $interview = Interview::create($validated);

        $this->activityService->log(
            $interview->candidate,
            'interview_scheduled',
            "Interview scheduled for {$validated['stage']}",
            ['interview_id' => $interview->id, 'calendar' => $calendarEvent]
        );

        event(new InterviewScheduled($interview->fresh()));

        $interview = $interview->load(['candidate', 'jobPosting', 'interviewer']);
        $this->interviewNotifications->notifyScheduled($interview);

        return $this->success($interview, 'Interview scheduled successfully', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $interview = Interview::findOrFail($id);

        $validated = $request->validate([
            'stage' => 'sometimes|string',
            'scheduled_at' => 'sometimes|date',
            'interviewer_id' => 'nullable|exists:users,id',
            'status' => 'sometimes|in:scheduled,completed,cancelled',
        ]);

        $interview->update($validated);

        return $this->success($interview->load(['candidate', 'interviewer']), 'Interview updated');
    }

    public function addFeedback(Request $request, $id): JsonResponse
    {
        $interview = Interview::findOrFail($id);

        $validated = $request->validate([
            'feedback' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'status' => 'required|in:scheduled,completed,cancelled',
        ]);

        $interview->update($validated);

        $this->activityService->log(
            $interview->candidate,
            'feedback',
            'Interview feedback submitted',
            ['interview_id' => $interview->id, 'rating' => $validated['rating']]
        );

        return $this->success($interview, 'Interview feedback saved');
    }
}
