<?php

namespace App\Modules\ATS\Models;

use App\Modules\Core\Tenancy\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Candidate extends Model
{
    use SoftDeletes, BelongsToTenant;
    protected $fillable = [
        'tenant_id', 'job_posting_id', 'name', 'email', 'phone', 'resume_path',
        'status', 'current_stage', 'rating', 'source',
        'manager_id', 'department_id', 'designation_id', 'joining_date',
        'employment_type', 'offered_salary', 'offer_token',
        'offer_sent_at', 'offer_accepted_at', 'offer_declined_at',
    ];

    public function jobPosting() {
        return $this->belongsTo(JobPosting::class);
    }

    public function interviews()
    {
        return $this->hasMany(Interview::class);
    }

    public function activities()
    {
        return $this->hasMany(CandidateActivity::class);
    }

    public function manager()
    {
        return $this->belongsTo(\App\Modules\Employee\Models\Employee::class, 'manager_id');
    }

    public function department()
    {
        return $this->belongsTo(\App\Modules\Employee\Models\Department::class);
    }

    public function designation()
    {
        return $this->belongsTo(\App\Modules\Employee\Models\Designation::class);
    }
}

