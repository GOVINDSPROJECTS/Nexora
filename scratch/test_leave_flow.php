<?php

use App\Models\User;
use App\Modules\Leave\Models\LeaveRequest;
use App\Modules\Leave\Models\LeaveType;
use Illuminate\Support\Facades\Auth;
use App\Modules\Core\Tenancy\TenantManager;

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// 1. Context: Employee Eric
$employeeUser = User::where('email', 'employee@test.com')->first();
Auth::login($employeeUser);
app(TenantManager::class)->setTenant($employeeUser->tenant);

echo "Logged in as Employee: " . $employeeUser->name . "\n";

$leaveType = LeaveType::first();
if (!$leaveType) {
    $leaveType = LeaveType::create([
        'tenant_id' => $employeeUser->tenant_id,
        'name' => 'Annual Leave',
        'code' => 'AL',
        'days_per_year' => 20
    ]);
}

$leaveRequest = LeaveRequest::create([
    'tenant_id' => $employeeUser->tenant_id,
    'employee_id' => $employeeUser->employee->id,
    'leave_type_id' => $leaveType->id,
    'start_date' => now()->addDays(5),
    'end_date' => now()->addDays(7),
    'status' => 'pending',
    'reason' => 'Testing manager approval'
]);

echo "Leave applied by Employee. ID: " . $leaveRequest->id . "\n";

// 2. Context: Manager Mike
$managerUser = User::where('email', 'manager@test.com')->first();
Auth::login($managerUser);
app(TenantManager::class)->setTenant($managerUser->tenant);

echo "Logged in as Manager: " . $managerUser->name . "\n";

// Test visibility
$visibleLeaves = LeaveRequest::whereHas('employee', function($q) use ($managerUser) {
    $q->where('manager_id', $managerUser->employee->id);
})->get();

echo "Manager can see " . $visibleLeaves->count() . " team leave requests.\n";

if ($visibleLeaves->where('id', $leaveRequest->id)->count() > 0) {
    echo "SUCCESS: Manager can see Employee's leave.\n";
} else {
    echo "FAILURE: Manager cannot see Employee's leave.\n";
}

// 3. Approve
$leaveRequest->update([
    'status' => 'approved',
    'approved_by' => $managerUser->id,
    'admin_comment' => 'Approved by your manager'
]);

echo "Leave approved by Manager.\n";

// 4. Verify
$finalLeave = LeaveRequest::find($leaveRequest->id);
echo "Final Leave Status: " . $finalLeave->status . "\n";
if ($finalLeave->status === 'approved') {
    echo "COMPLETE FLOW SUCCESS\n";
} else {
    echo "COMPLETE FLOW FAILURE\n";
}
