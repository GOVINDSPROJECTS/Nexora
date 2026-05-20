<?php

namespace App\Modules\Integration\Drivers;

class ZohoCliqDriver
{
    public function sendNotification(string $channel, string $message): bool
    {
        return true;
    }
}
