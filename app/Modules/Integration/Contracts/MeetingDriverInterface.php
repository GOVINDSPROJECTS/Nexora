<?php

namespace App\Modules\Integration\Contracts;

interface MeetingDriverInterface
{
    public function generateMeetingLink(string $title, string $datetime, array $attendees = []): string;
}
