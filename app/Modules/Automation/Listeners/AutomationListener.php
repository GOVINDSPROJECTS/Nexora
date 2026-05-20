<?php

namespace App\Modules\Automation\Listeners;

use App\Modules\Automation\Services\AutomationService;

class AutomationListener
{
    protected $automationService;

    public function __construct(AutomationService $automationService)
    {
        $this->automationService = $automationService;
    }

    public function handle($event)
    {
        $this->automationService->handleEvent($event);
    }
}
