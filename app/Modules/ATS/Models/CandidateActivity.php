<?php

namespace App\Modules\ATS\Models;

use App\Modules\Core\Tenancy\Traits\BelongsToTenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class CandidateActivity extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'candidate_id',
        'user_id',
        'type',
        'description',
        'properties',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
