<?php

namespace App\Modules\Automation\Models;

use Illuminate\Database\Eloquent\Model;

class WorkflowAction extends Model
{
    protected $fillable = ['workflow_id', 'type', 'configuration', 'delay_minutes', 'order'];

    protected $casts = [
        'configuration' => 'array',
    ];

    public function workflow()
    {
        return $this->belongsTo(Workflow::class);
    }
}
