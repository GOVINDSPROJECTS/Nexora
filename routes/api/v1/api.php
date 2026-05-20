<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'Nexora API v1 is healthy',
        'data'    => [
            'version' => '1.0.0',
            'environment' => config('app.env'),
        ]
    ]);
});

Route::middleware('web')->group(function () {
    // Public Routes
    Route::post('/register', [\App\Modules\Auth\Controllers\RegisterController::class, 'register']);
    Route::post('/login', [\App\Modules\Auth\Controllers\LoginController::class, 'login']);

    // Authenticated Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [\App\Modules\Auth\Controllers\LoginController::class, 'user']);
        Route::post('/logout', [\App\Modules\Auth\Controllers\LoginController::class, 'logout']);

        Route::get('/dashboard/stats', [\App\Modules\Core\Controllers\DashboardController::class, 'index']);

        // Module Routes...
        Route::apiResource('employees', \App\Modules\Employee\Controllers\EmployeeController::class);

        // Leave Module
        Route::get('/leave/types', [\App\Modules\Leave\Controllers\LeaveController::class, 'types']);
        Route::apiResource('leaves', \App\Modules\Leave\Controllers\LeaveController::class);

        // Attendance Module
        Route::get('/attendance', [\App\Modules\Attendance\Controllers\AttendanceController::class, 'index']);
        Route::post('/attendance/clock-in', [\App\Modules\Attendance\Controllers\AttendanceController::class, 'clockIn']);
        Route::post('/attendance/clock-out', [\App\Modules\Attendance\Controllers\AttendanceController::class, 'clockOut']);

        // ATS Module
        Route::get('/jobs', [\App\Modules\ATS\Controllers\JobController::class, 'index']);
        Route::post('/jobs', [\App\Modules\ATS\Controllers\JobController::class, 'store']);
        Route::get('/jobs/{id}/candidates', [\App\Modules\ATS\Controllers\JobController::class, 'candidates']);
    });
});
