<?php

namespace App\Modules\Automation\Models;

use Illuminate\Database\Eloquent\Model;
use App\Modules\Core\Tenancy\Traits\BelongsToTenant;

class Workflow extends Model
{
    use BelongsToTenant;

    protected $fillable = ['tenant_id', 'name', 'event_type', 'conditions', 'is_active'];

    protected $casts = [
        'conditions' => 'array',
        'is_active' => 'boolean',
    ];

    public function actions()
    {
        return $this->hasMany(WorkflowAction::class)->orderBy('order');
    }

    public function logs()
    {
        return $this->hasMany(WorkflowLog::class);
    }
}
