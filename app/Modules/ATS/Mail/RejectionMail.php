<?php

namespace App\Modules\ATS\Mail;

use App\Modules\ATS\Models\Candidate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RejectionMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Candidate $candidate)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Application Status — Nexora',
        );
    }

    public function content(): Content
    {
        return new Content(
            html: 'emails.candidate-rejection',
        );
    }
}
