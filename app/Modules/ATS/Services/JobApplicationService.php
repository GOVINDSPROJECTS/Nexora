<?php

namespace App\Modules\ATS\Services;

use App\Modules\ATS\Mail\ApplicationReceivedMail;
use App\Modules\ATS\Mail\NewJobApplicationMail;
use App\Modules\ATS\Models\Candidate;
use App\Modules\ATS\Models\JobPosting;
use App\Modules\Integration\Services\IntegrationService;
use App\Modules\Notification\Services\MailService;
use App\Modules\Notification\Services\NotificationService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class JobApplicationService
{
    public function __construct(
        protected CandidateActivityService $activityService,
        protected MailService $mailService,
        protected NotificationService $notificationService,
        protected IntegrationService $integrationService
    ) {
    }

    public function apply(JobPosting $job, array $data, ?UploadedFile $resume = null): Candidate
    {
        $resumePath = null;
        if ($resume) {
            $resumePath = $resume->store('resumes', 'public');
        }

        $candidate = Candidate::withoutGlobalScopes()->create([
            'tenant_id' => $job->tenant_id,
            'job_posting_id' => $job->id,
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'resume_path' => $resumePath,
            'status' => 'applied',
            'current_stage' => 'Applied',
            'source' => 'public_apply',
        ]);

        $this->activityService->log($candidate, 'applied', 'Candidate applied via public job link');

        $this->mailService->send($candidate->email, new ApplicationReceivedMail($job, $candidate->name));

        if ($job->creator) {
            $this->mailService->send($job->creator->email, new NewJobApplicationMail($job, $candidate));
            $this->notificationService->send(
                $job->creator,
                'new_application',
                'New application',
                "{$candidate->name} applied for {$job->title}",
                'ats',
                'high',
                ['candidate_id' => $candidate->id, 'job_id' => $job->id]
            );
        }

        $this->integrationService->notifyChat(
            'hiring',
            "New application: {$candidate->name} → {$job->title} ({$candidate->email})"
        );

        return $candidate;
    }
}
