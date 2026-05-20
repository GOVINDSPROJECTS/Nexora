<?php

namespace App\Modules\Integration\Drivers;

use App\Modules\Integration\Contracts\CalendarDriverInterface;

class GoogleCalendarDriver implements CalendarDriverInterface
{
    public function createEvent(string $title, string $datetime, int $durationMinutes, array $attendees = []): array
    {
        return [
            'provider' => 'google_calendar',
            'event_id' => 'gcal_' . uniqid(),
            'title' => $title,
            'starts_at' => $datetime,
            'duration_minutes' => $durationMinutes,
            'attendees' => $attendees,
        ];
    }
}
