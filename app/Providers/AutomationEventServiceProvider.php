<?php

namespace App\Providers;

use App\Modules\Automation\Events\CandidateSelected;
use App\Modules\Automation\Events\EmployeeCreated;
use App\Modules\Automation\Events\InterviewScheduled;
use App\Modules\Automation\Events\LeaveApproved;
use App\Modules\Automation\Events\TaskOverdue;
use App\Modules\Automation\Listeners\AutomationListener;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AutomationEventServiceProvider extends ServiceProvider
{
    protected array $workflowEvents = [
        EmployeeCreated::class,
        LeaveApproved::class,
        TaskOverdue::class,
        CandidateSelected::class,
        InterviewScheduled::class,
    ];

    public function boot(): void
    {
        foreach ($this->workflowEvents as $eventClass) {
            Event::listen($eventClass, [AutomationListener::class, 'handle']);
        }
    }
}
