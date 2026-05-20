<?php

namespace App\Modules\Leave\Controllers;

use App\Modules\Shared\Controllers\BaseController;
use App\Modules\Leave\Models\LeaveRequest;
use App\Modules\Leave\Models\LeaveType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LeaveController extends BaseController
{
    /**
     * List leave requests for the tenant.
     */
    public function index(Request $request): JsonResponse
    {
        $query = LeaveRequest::with(['employee', 'leaveType'])->latest();
        
        $user = auth()->user();
        $employee = \App\Modules\Employee\Models\Employee::where('user_id', $user->id)->first();

        // Admin/HR can see all
        if ($user->hasRole([\App\Modules\Auth\Constants\Permissions::ROLE_TENANT_ADMIN, \App\Modules\Auth\Constants\Permissions::ROLE_HR])) {
            // No filter
        } 
        // Manager can see their own + their team's
        elseif ($user->hasRole('Manager')) {
            if ($employee) {
                $query->where(function ($q) use ($employee) {
                    $q->where('employee_id', $employee->id)
                      ->orWhereHas('employee', function ($sq) use ($employee) {
                          $sq->where('manager_id', $employee->id);
                      });
                });
            } else {
                return $this->success(['data' => []]);
            }
        } 
        // Standard Employee can only see their own
        else {
            if ($employee) {
                $query->where('employee_id', $employee->id);
            } else {
                return $this->success(['data' => []]);
            }
        }

        $leaves = $query->paginate(15);
        return $this->success($leaves);
    }

    /**
     * Apply for leave.
     */
    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();
        $employee = \App\Modules\Employee\Models\Employee::where('user_id', $user->id)->first();
        
        if (!$employee) {
            return $this->error('No employee profile found for this account.', 400);
        }

        $validated = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date'    => 'required|date',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'reason'        => 'nullable|string',
        ]);

        $leave = LeaveRequest::create(array_merge($validated, [
            'employee_id' => $employee->id,
            'status' => 'pending',
        ]));

        return $this->success($leave, 'Leave request submitted successfully', 201);
    }

    /**
     * Approve or Reject leave.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status'        => 'required|in:approved,rejected',
            'admin_comment' => 'nullable|string',
        ]);

        $leave = LeaveRequest::findOrFail($id);
        $user = auth()->user();
        $isManager = false;

        if ($user->hasRole('Manager')) {
            $managerEmployee = \App\Modules\Employee\Models\Employee::where('user_id', $user->id)->first();
            if ($managerEmployee && $leave->employee->manager_id === $managerEmployee->id) {
                $isManager = true;
            }
        }

        if (!$user->hasRole([\App\Modules\Auth\Constants\Permissions::ROLE_TENANT_ADMIN, \App\Modules\Auth\Constants\Permissions::ROLE_HR]) && !$isManager) {
            return $this->error('Unauthorized to approve this leave request.', 403);
        }

        $leave->update([
            'status'        => $validated['status'],
            'admin_comment' => $validated['admin_comment'] ?? null,
            'approved_by'   => $user->id,
        ]);

        if ($validated['status'] === 'approved') {
            event(new \App\Modules\Automation\Events\LeaveApproved($leave->load('employee.user')));
        }

        return $this->success($leave, "Leave request {$validated['status']} successfully");
    }

    /**
     * List leave types.
     */
    public function types(): JsonResponse
    {
        return $this->success(LeaveType::all());
    }
}
