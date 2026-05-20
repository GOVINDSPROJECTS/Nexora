<?php

namespace App\Modules\Integration\Drivers;

use App\Modules\Integration\Contracts\MeetingDriverInterface;

class GoogleMeetDriver implements MeetingDriverInterface
{
    public function generateMeetingLink(string $title, string $datetime, array $attendees = []): string
    {
        return 'https://meet.google.com/' . substr(md5($title . $datetime), 0, 12);
    }
}
