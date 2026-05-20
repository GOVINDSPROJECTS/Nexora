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
}
