<?php

namespace App\Modules\Automation\Models;

use Illuminate\Database\Eloquent\Model;

class WorkflowLog extends Model
{
    protected $fillable = ['workflow_id', 'target_type', 'target_id', 'status', 'error_message', 'result_data'];

    protected $casts = [
        'result_data' => 'array',
    ];

    public function workflow()
    {
        return $this->belongsTo(Workflow::class);
    }

    public function target()
    {
        return $this->morphTo();
    }
}
