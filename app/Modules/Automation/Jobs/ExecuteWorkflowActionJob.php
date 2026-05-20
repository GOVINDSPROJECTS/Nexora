<?php

namespace App\Modules\Automation\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Modules\Automation\Models\WorkflowAction;

class ExecuteWorkflowActionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $action;
    protected $event;

    /**
     * Create a new job instance.
     */
    public function __construct(WorkflowAction $action, $event)
    {
        $this->action = $action;
        $this->event = $event;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        app(\App\Modules\Automation\Services\AutomationService::class)
            ->runAction($this->action, $this->event);
    }
}
