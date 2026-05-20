<?php

namespace App\Modules\Automation\Events;

use App\Modules\ATS\Models\Candidate;

class CandidateSelected extends BaseWorkflowEvent
{
    public function __construct(Candidate $target)
    {
        parent::__construct($target);
    }
}
