<?php

namespace App\Modules\ATS\Services;

use App\Modules\ATS\Mail\InterviewScheduledMail;
use App\Modules\ATS\Models\Interview;
use App\Modules\Integration\Services\IntegrationService;
use App\Modules\Notification\Services\MailService;
use App\Modules\Notification\Services\NotificationService;

class InterviewNotificationService
{
    public function __construct(
        protected MailService $mailService,
        protected NotificationService $notificationService,
        protected IntegrationService $integrationService
    ) {
    }

    public function notifyScheduled(Interview $interview): void
    {
        $interview->loadMissing(['candidate', 'jobPosting', 'interviewer']);

        if ($interview->candidate?->email) {
            $this->mailService->send(
                $interview->candidate->email,
                new InterviewScheduledMail($interview),
                $interview->candidate->name
            );
        }

        $locationDetails = $interview->location_type === 'online'
            ? 'Meet: ' . ($interview->meeting_link ?? 'TBD')
            : 'Address: ' . ($interview->location_address ?? 'TBD');

        $message = sprintf(
            'Interview scheduled: %s — %s at %s. %s',
            $interview->candidate?->name,
            $interview->stage,
            $interview->scheduled_at->format('M j, Y H:i'),
            $locationDetails
        );

        $this->integrationService->notifyChat('hiring', $message);

        if ($interview->interviewer) {
            $this->notificationService->send(
                $interview->interviewer,
                'interview_scheduled',
                'Interview scheduled',
                "You are interviewing {$interview->candidate?->name} ({$interview->stage})",
                'ats',
                'high',
                ['interview_id' => $interview->id]
            );
        }
    }
}
