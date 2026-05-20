<?php

namespace App\Modules\Attendance\Controllers;

use App\Modules\Shared\Controllers\BaseController;
use App\Modules\Attendance\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class AttendanceController extends BaseController
{
    /**
     * Get attendance history.
     */
    public function index(Request $request): JsonResponse
    {
        $attendance = Attendance::with('employee')->latest()->paginate(15);
        return $this->success($attendance);
    }

    /**
     * Handle clock-in.
     */
    public function clockIn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
        ]);

        $today = Carbon::today()->toDateString();
        
        $attendance = Attendance::firstOrCreate(
            ['employee_id' => $validated['employee_id'], 'date' => $today],
            ['clock_in' => Carbon::now()->toTimeString(), 'ip_address' => $request->ip()]
        );

        return $this->success($attendance, 'Clocked in successfully');
    }

    /**
     * Handle clock-out.
     */
    public function clockOut(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
        ]);

        $today = Carbon::today()->toDateString();
        
        $attendance = Attendance::where('employee_id', $validated['employee_id'])
            ->where('date', $today)
            ->first();

        if (!$attendance) {
            return $this->error('No clock-in record found for today', 404);
        }

        $attendance->update([
            'clock_out' => Carbon::now()->toTimeString()
        ]);

        return $this->success($attendance, 'Clocked out successfully');
    }
}
