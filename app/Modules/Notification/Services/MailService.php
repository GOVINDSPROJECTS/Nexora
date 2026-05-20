<?php

namespace App\Modules\Notification\Services;

use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MailService
{
    public function send(string $to, Mailable $mailable, ?string $name = null): bool
    {
        try {
            Mail::to($to, $name)->queue($mailable);
            return true;
        } catch (\Throwable $e) {
            Log::error('Mail send failed: ' . $e->getMessage(), ['to' => $to]);
            return false;
        }
    }

    public function sendNow(string $to, Mailable $mailable, ?string $name = null): bool
    {
        try {
            Mail::to($to, $name)->send($mailable);
            return true;
        } catch (\Throwable $e) {
            Log::error('Mail send failed: ' . $e->getMessage(), ['to' => $to]);
            return false;
        }
    }
}
