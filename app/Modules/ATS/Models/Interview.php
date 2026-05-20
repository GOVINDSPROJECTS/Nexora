<?php

namespace App\Modules\ATS\Models;

use Illuminate\Database\Eloquent\Model;
use App\Modules\Core\Tenancy\Traits\BelongsToTenant;
use App\Models\User;

class Interview extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'candidate_id',
        'job_posting_id',
        'interviewer_id',
        'stage',
        'scheduled_at',
        'status',
        'feedback',
        'rating',
        'meeting_link',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }

    public function jobPosting()
    {
        return $this->belongsTo(JobPosting::class);
    }

    public function interviewer()
    {
        return $this->belongsTo(User::class, 'interviewer_id');
    }
}
