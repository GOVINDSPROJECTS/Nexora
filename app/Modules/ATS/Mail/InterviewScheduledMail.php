<?php

namespace App\Modules\ATS\Mail;

use App\Modules\ATS\Models\Interview;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InterviewScheduledMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Interview $interview)
    {
        $this->interview->loadMissing(['candidate', 'jobPosting']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Interview scheduled — ' . ($this->interview->jobPosting?->title ?? 'Nexora'),
        );
    }

    public function content(): Content
    {
        return new Content(
            html: 'emails.interview-scheduled',
            text: 'emails.interview-scheduled-text',
        );
    }
}
