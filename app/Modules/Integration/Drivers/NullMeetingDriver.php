<?php

namespace App\Modules\Integration\Drivers;

use App\Modules\Integration\Contracts\MeetingDriverInterface;

class NullMeetingDriver implements MeetingDriverInterface
{
    public function generateMeetingLink(string $title, string $datetime, array $attendees = []): string
    {
        return '';
    }
}
