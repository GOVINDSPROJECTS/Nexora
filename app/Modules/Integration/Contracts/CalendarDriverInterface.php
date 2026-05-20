<?php

namespace App\Modules\Integration\Contracts;

interface CalendarDriverInterface
{
    public function createEvent(string $title, string $datetime, int $durationMinutes, array $attendees = []): array;
}
