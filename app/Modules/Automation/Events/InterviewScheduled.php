<?php

namespace App\Modules\Automation\Events;

use App\Modules\ATS\Models\Interview;

class InterviewScheduled extends BaseWorkflowEvent
{
    public function __construct(Interview $target)
    {
        parent::__construct($target);
    }
}
