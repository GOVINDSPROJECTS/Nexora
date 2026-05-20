<?php

namespace App\Modules\Shared\Traits;

use App\Modules\Shared\Models\Approval;

trait Approvable
{
    public function approvals()
    {
        return $this->morphMany(Approval::class, 'approvable');
    }

    public function currentApproval()
    {
        return $this->morphOne(Approval::class, 'approvable')->latestOfMany();
    }

    public function initiateApproval()
    {
        return $this->approvals()->create([
            'tenant_id' => $this->tenant_id,
            'status' => 'pending',
        ]);
    }
}
