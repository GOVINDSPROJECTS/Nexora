<?php

namespace App\Modules\ATS\Mail;

use App\Modules\ATS\Models\JobPosting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicationReceivedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public JobPosting $job, public string $candidateName)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Application received — ' . $this->job->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            html: 'emails.application-received',
        );
    }
}
