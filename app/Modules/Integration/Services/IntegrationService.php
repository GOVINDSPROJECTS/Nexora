<?php

namespace App\Modules\Integration\Services;

use App\Modules\Integration\Contracts\CalendarDriverInterface;
use App\Modules\Integration\Contracts\MeetingDriverInterface;
use App\Modules\Integration\Drivers\ZohoCliqDriver;
use Exception;

class IntegrationService
{
    protected ?MeetingDriverInterface $meetingDriver = null;
    protected ?CalendarDriverInterface $calendarDriver = null;
    protected ?ZohoCliqDriver $chatDriver = null;

    public function __construct(?string $meetingDriver = null, ?string $calendarDriver = null)
    {
        $this->meetingDriver = $this->resolveDriver('meeting', $meetingDriver ?? config('integrations.default_meeting'));
        $this->calendarDriver = $this->resolveDriver('calendar', $calendarDriver ?? config('integrations.default_calendar'));
        $this->chatDriver = $this->resolveDriver('chat', 'zoho_cliq');
    }

    protected function resolveDriver(string $type, string $name): mixed
    {
        $class = config("integrations.drivers.{$type}.{$name}");
        if (!$class || !class_exists($class)) {
            return null;
        }

        return app($class);
    }

    public function generateMeeting(string $title, string $datetime, array $attendees = []): string
    {
        if (!$this->meetingDriver) {
            throw new Exception('No meeting integration configured.');
        }

        return $this->meetingDriver->generateMeetingLink($title, $datetime, $attendees);
    }

    public function syncCalendarEvent(string $title, string $datetime, int $durationMinutes = 60, array $attendees = []): array
    {
        if (!$this->calendarDriver) {
            return ['provider' => 'none', 'synced' => false];
        }

        return $this->calendarDriver->createEvent($title, $datetime, $durationMinutes, $attendees);
    }

    public function notifyChat(string $channel, string $message): bool
    {
        if (!$this->chatDriver) {
            return false;
        }

        return $this->chatDriver->sendNotification($channel, $message);
    }
}
