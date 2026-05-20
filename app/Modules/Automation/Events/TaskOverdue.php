<?php

namespace App\Modules\Automation\Events;

use App\Modules\Task\Models\Task;

class TaskOverdue extends BaseWorkflowEvent
{
    public function __construct(Task $target)
    {
        parent::__construct($target);
    }
}
