<?php

namespace App\Modules\Shared\Services;

use App\Modules\Shared\Models\Approval;
use Illuminate\Support\Facades\Auth;

class ApprovalService
{
    public function approve(int $approvalId, ?string $comment = null)
    {
        $approval = Approval::findOrFail($approvalId);
        
        $approval->update([
            'status' => 'approved',
            'comment' => $comment,
            'action_by' => Auth::id(),
            'action_at' => now(),
        ]);

        // Sync back to parent if needed
        $parent = $approval->approvable;
        if (method_exists($parent, 'onApproved')) {
            $parent->onApproved($approval);
        } else {
            $parent->update(['status' => 'approved']);
        }

        return $approval;
    }

    public function reject(int $approvalId, ?string $comment = null)
    {
        $approval = Approval::findOrFail($approvalId);
        
        $approval->update([
            'status' => 'rejected',
            'comment' => $comment,
            'action_by' => Auth::id(),
            'action_at' => now(),
        ]);

        $parent = $approval->approvable;
        if (method_exists($parent, 'onRejected')) {
            $parent->onRejected($approval);
        } else {
            $parent->update(['status' => 'rejected']);
        }

        return $approval;
    }
}
