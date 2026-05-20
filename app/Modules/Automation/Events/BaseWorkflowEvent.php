<?php

namespace App\Modules\Automation\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

abstract class BaseWorkflowEvent
{
    use Dispatchable, SerializesModels;

    public $target;

    public function __construct($target)
    {
        $this->target = $target;
    }
}
