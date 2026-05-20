<?php

return [
    'default_meeting' => env('INTEGRATION_MEETING_DRIVER', 'google_meet'),
    'default_calendar' => env('INTEGRATION_CALENDAR_DRIVER', 'google_calendar'),

    'drivers' => [
        'meeting' => [
            'google_meet' => \App\Modules\Integration\Drivers\GoogleMeetDriver::class,
            'null' => \App\Modules\Integration\Drivers\NullMeetingDriver::class,
        ],
        'calendar' => [
            'google_calendar' => \App\Modules\Integration\Drivers\GoogleCalendarDriver::class,
        ],
        'chat' => [
            'zoho_cliq' => \App\Modules\Integration\Drivers\ZohoCliqDriver::class,
        ],
    ],
];
