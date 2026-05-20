<?php

namespace App\Modules\Notification\Services;

use App\Models\User;
use App\Modules\Notification\Notifications\NexoraDatabaseNotification;
use App\Modules\Notification\Events\NotificationSent;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public function send(
        User $user,
        string $type,
        string $title,
        string $message,
        string $category = 'general',
        string $priority = 'normal',
        array $data = []
    ): void {
        if (!$this->isEnabled($user, $category, 'in_app')) {
            return;
        }

        $user->notify(new NexoraDatabaseNotification(
            $type,
            $title,
            $message,
            $category,
            $priority,
            $data
        ));

        event(new NotificationSent($user, $type, $title, $message, $category, $priority, $data));
    }

    public function isEnabled(User $user, string $category, string $channel): bool
    {
        $pref = \App\Modules\Notification\Models\NotificationPreference::where('user_id', $user->id)
            ->where('category', $category)
            ->first();

        if (!$pref) {
            return true;
        }

        return $channel === 'email' ? $pref->email : $pref->in_app;
    }

    public function queueEmail(User $user, string $subject, string $body, string $category = 'general'): void
    {
        if (!$this->isEnabled($user, $category, 'email')) {
            return;
        }

        // Queued mail placeholder — wire Mailable in production
        Log::info('Notification email queued', [
            'user_id' => $user->id,
            'subject' => $subject,
            'category' => $category,
        ]);
    }
}
