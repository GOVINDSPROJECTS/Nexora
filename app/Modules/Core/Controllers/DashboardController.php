<?php

namespace App\Modules\Core\Controllers;

use App\Modules\Shared\Controllers\BaseController;
use App\Modules\Employee\Models\Employee;
use App\Modules\Leave\Models\LeaveRequest;
use App\Modules\ATS\Models\JobPosting;
use App\Modules\Attendance\Models\Attendance;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DashboardController extends BaseController
{
    public function index(): JsonResponse
    {
        return $this->success([
            'total_employees' => Employee::count(),
            'pending_leaves' => LeaveRequest::where('status', 'pending')->count(),
            'open_jobs' => JobPosting::where('status', 'published')->count(),
            'attendance_today' => Attendance::where('date', Carbon::today()->toDateString())->count(),
        ]);
    }
}
