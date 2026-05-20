<?php

namespace App\Modules\ATS\Services;

use App\Models\User;
use App\Modules\ATS\Models\JobPosting;
use App\Modules\Auth\Constants\Permissions;
use Illuminate\Support\Str;

class JobService
{
    public function listForUser(User $user)
    {
        $query = JobPosting::with(['creator:id,name,email'])
            ->withCount('candidates')
            ->latest();

        if (!$user->hasRole([Permissions::ROLE_TENANT_ADMIN, Permissions::ROLE_HR])) {
            $query->where('created_by', $user->id);
        }

        return $query;
    }

    public function canManage(User $user, JobPosting $job): bool
    {
        if ($user->hasRole(Permissions::ROLE_TENANT_ADMIN)) {
            return true;
        }

        if ($user->hasRole(Permissions::ROLE_HR)) {
            return (int) $job->created_by === (int) $user->id;
        }

        return false;
    }

    public function canView(User $user, JobPosting $job): bool
    {
        if ($user->hasRole(Permissions::ROLE_TENANT_ADMIN)) {
            return true;
        }

        if ($user->hasRole(Permissions::ROLE_HR)) {
            return true;
        }

        return (int) $job->created_by === (int) $user->id;
    }

    public function generateSlug(string $title): string
    {
        $base = Str::slug($title);
        do {
            $slug = $base . '-' . Str::lower(Str::random(8));
        } while (JobPosting::withoutGlobalScopes()->where('public_slug', $slug)->exists());

        return $slug;
    }

    public function applyUrl(JobPosting $job): string
    {
        return rtrim(config('app.url'), '/') . '/apply/' . $job->public_slug;
    }
}
