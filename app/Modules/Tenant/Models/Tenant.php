<?php

namespace App\Modules\Tenant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'subdomain',
        'domain',
        'logo',
        'timezone',
        'contact_email',
        'settings',
        'branding',
        'onboarding_completed_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'branding' => 'array',
        'onboarding_completed_at' => 'datetime',
    ];

    /**
     * Get the users associated with the tenant.
     */
    public function users()
    {
        return $this->hasMany(\App\Models\User::class);
    }
}
