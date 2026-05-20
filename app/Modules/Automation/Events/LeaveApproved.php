<?php

namespace App\Modules\Automation\Events;

use App\Modules\Leave\Models\LeaveRequest;

class LeaveApproved extends BaseWorkflowEvent
{
    public function __construct(LeaveRequest $target)
    {
        parent::__construct($target);
    }
}
