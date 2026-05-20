<?php

namespace App\Modules\Reporting\Controllers;

use App\Modules\ATS\Models\Candidate;
use App\Modules\Attendance\Models\Attendance;
use App\Modules\Employee\Models\Employee;
use App\Modules\Leave\Models\LeaveRequest;
use App\Modules\Reporting\Support\ReportDateSql;
use App\Modules\Shared\Controllers\BaseController;
use App\Modules\Task\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportingController extends BaseController
{
    public function dashboardSummary(Request $request): JsonResponse
    {
        $from = $request->date('from') ?? now()->subMonths(6)->startOfMonth();
        $to = $request->date('to') ?? now()->endOfMonth();

        $monthYear = ReportDateSql::monthYear('joining_date');
        $growth = Employee::select(
            DB::raw("{$monthYear} as month"),
            DB::raw('count(*) as count')
        )
            ->whereNotNull('joining_date')
            ->whereBetween('joining_date', [$from, $to])
            ->groupBy('month')
            ->orderByRaw('MIN(joining_date)')
            ->limit(12)
            ->get();

        $departments = Employee::with('department')
            ->select('department_id', DB::raw('count(*) as count'))
            ->groupBy('department_id')
            ->get()
            ->map(fn ($item) => [
                'name' => $item->department->name ?? 'Unassigned',
                'count' => $item->count,
            ]);

        $tasks = Task::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $leaveMonth = ReportDateSql::month('start_date');
        $leaves = LeaveRequest::select(
            DB::raw("{$leaveMonth} as month"),
            DB::raw('count(*) as count')
        )
            ->where('status', 'approved')
            ->whereBetween('start_date', [$from, $to])
            ->groupBy('month')
            ->orderByRaw('MIN(start_date)')
            ->get();

        $hiringFunnel = Candidate::select('current_stage', DB::raw('count(*) as count'))
            ->groupBy('current_stage')
            ->get();

        $attendanceDay = ReportDateSql::date('date');
        $attendanceTrends = Attendance::select(
            DB::raw("{$attendanceDay} as day"),
            DB::raw('count(*) as count')
        )
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->groupBy('day')
            ->orderBy('day')
            ->limit(30)
            ->get();

        $taskMonth = ReportDateSql::month('created_at');
        $taskProductivity = Task::select(
            DB::raw("{$taskMonth} as month"),
            DB::raw("SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed"),
            DB::raw('count(*) as total')
        )
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('month')
            ->get();

        return $this->success([
            'growth' => $growth,
            'departments' => $departments,
            'tasks' => $tasks,
            'leaves' => $leaves,
            'hiring_funnel' => $hiringFunnel,
            'attendance_trends' => $attendanceTrends,
            'task_productivity' => $taskProductivity,
            'date_range' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
        ]);
    }

    public function hiringFunnel(): JsonResponse
    {
        $funnel = Candidate::select('current_stage', DB::raw('count(*) as count'))
            ->groupBy('current_stage')
            ->get();

        return $this->success($funnel);
    }
}
