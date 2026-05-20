<?php

namespace App\Modules\Automation\Events;

use App\Modules\Employee\Models\Employee;

class EmployeeCreated extends BaseWorkflowEvent
{
    public function __construct(Employee $target)
    {
        parent::__construct($target);
    }
}
