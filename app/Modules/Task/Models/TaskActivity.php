<?php

namespace App\Modules\Task\Models;

use App\Modules\Core\Tenancy\Traits\BelongsToTenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class TaskActivity extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'task_id',
        'user_id',
        'activity_type',
        'description',
        'properties',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
