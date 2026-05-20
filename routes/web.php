<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::prefix('api/v1')->middleware(['throttle:api'])->group(function () {
    Route::get('/health', [\App\Modules\Core\Controllers\HealthController::class, 'index']);
    Route::get('/health/diagnostics', [\App\Modules\Core\Controllers\HealthController::class, 'diagnostics']);

    Route::post('/register', [\App\Modules\Auth\Controllers\RegisterController::class, 'register']);
    Route::post('/login', [\App\Modules\Auth\Controllers\LoginController::class, 'login']);
    Route::post('/auth/token', [\App\Modules\Auth\Controllers\MobileAuthController::class, 'token']);

    Route::get('/public/jobs/{slug}', [\App\Modules\ATS\Controllers\PublicJobController::class, 'show']);
    Route::post('/public/jobs/{slug}/apply', [\App\Modules\ATS\Controllers\PublicJobController::class, 'apply']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [\App\Modules\Auth\Controllers\LoginController::class, 'user']);
        Route::post('/logout', [\App\Modules\Auth\Controllers\LoginController::class, 'logout']);
        Route::post('/auth/revoke', [\App\Modules\Auth\Controllers\MobileAuthController::class, 'revoke']);
        Route::post('/auth/refresh', [\App\Modules\Auth\Controllers\MobileAuthController::class, 'refresh']);

        Route::get('/dashboard/stats', [\App\Modules\Core\Controllers\DashboardController::class, 'index']);
        Route::get('/dashboard/summary', [\App\Modules\Reporting\Controllers\ReportingController::class, 'dashboardSummary']);
        Route::get('/reports/hiring-funnel', [\App\Modules\Reporting\Controllers\ReportingController::class, 'hiringFunnel']);

        Route::get('/org/departments', [\App\Modules\Employee\Controllers\OrgController::class, 'departments']);
        Route::get('/org/designations', [\App\Modules\Employee\Controllers\OrgController::class, 'designations']);
        Route::get('/org/chart', [\App\Modules\Employee\Controllers\OrgController::class, 'chart']);

        Route::apiResource('employees', \App\Modules\Employee\Controllers\EmployeeController::class);

        Route::get('/leave/types', [\App\Modules\Leave\Controllers\LeaveController::class, 'types']);
        Route::patch('/leaves/{id}/status', [\App\Modules\Leave\Controllers\LeaveController::class, 'updateStatus']);
        Route::apiResource('leaves', \App\Modules\Leave\Controllers\LeaveController::class);

        Route::apiResource('tasks', \App\Modules\Task\Controllers\TaskController::class);
        Route::post('/tasks/{id}/comments', [\App\Modules\Task\Controllers\TaskController::class, 'addComment']);
        Route::get('/tasks/{id}/timeline', [\App\Modules\Task\Controllers\TaskController::class, 'timeline']);

        Route::get('/notifications', [\App\Modules\Notification\Controllers\NotificationController::class, 'index']);
        Route::get('/notifications/preferences', [\App\Modules\Notification\Controllers\NotificationController::class, 'preferences']);
        Route::put('/notifications/preferences', [\App\Modules\Notification\Controllers\NotificationController::class, 'updatePreferences']);
        Route::post('/notifications/{id}/read', [\App\Modules\Notification\Controllers\NotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [\App\Modules\Notification\Controllers\NotificationController::class, 'markAllAsRead']);

        Route::get('/candidates/pipeline-summary', [\App\Modules\ATS\Controllers\CandidateController::class, 'pipelineSummary']);
        Route::post('/candidates/{id}/notes', [\App\Modules\ATS\Controllers\CandidateController::class, 'addNote']);
        Route::get('/candidates/{id}/activities', [\App\Modules\ATS\Controllers\CandidateController::class, 'activities']);
        Route::post('/candidates/{id}/resume', [\App\Modules\ATS\Controllers\CandidateController::class, 'uploadResume']);
        Route::apiResource('candidates', \App\Modules\ATS\Controllers\CandidateController::class);

        Route::get('/interviews', [\App\Modules\ATS\Controllers\InterviewController::class, 'index']);
        Route::post('/interviews', [\App\Modules\ATS\Controllers\InterviewController::class, 'store']);
        Route::put('/interviews/{id}', [\App\Modules\ATS\Controllers\InterviewController::class, 'update']);
        Route::post('/interviews/{id}/feedback', [\App\Modules\ATS\Controllers\InterviewController::class, 'addFeedback']);

        Route::get('/jobs', [\App\Modules\ATS\Controllers\JobController::class, 'index']);
        Route::post('/jobs', [\App\Modules\ATS\Controllers\JobController::class, 'store']);
        Route::get('/jobs/{id}', [\App\Modules\ATS\Controllers\JobController::class, 'show']);
        Route::put('/jobs/{id}', [\App\Modules\ATS\Controllers\JobController::class, 'update']);
        Route::delete('/jobs/{id}', [\App\Modules\ATS\Controllers\JobController::class, 'destroy']);
        Route::get('/jobs/{id}/candidates', [\App\Modules\ATS\Controllers\JobController::class, 'candidates']);

        Route::get('/attendance', [\App\Modules\Attendance\Controllers\AttendanceController::class, 'index']);
        Route::post('/attendance/clock-in', [\App\Modules\Attendance\Controllers\AttendanceController::class, 'clockIn']);
        Route::post('/attendance/clock-out', [\App\Modules\Attendance\Controllers\AttendanceController::class, 'clockOut']);

        Route::get('/workflows', [\App\Modules\Automation\Controllers\WorkflowController::class, 'index']);
        Route::post('/workflows', [\App\Modules\Automation\Controllers\WorkflowController::class, 'store']);
        Route::put('/workflows/{id}', [\App\Modules\Automation\Controllers\WorkflowController::class, 'update']);
        Route::delete('/workflows/{id}', [\App\Modules\Automation\Controllers\WorkflowController::class, 'destroy']);
        Route::get('/workflows/{id}/logs', [\App\Modules\Automation\Controllers\WorkflowController::class, 'logs']);

        Route::get('/tenant/settings', [\App\Modules\Tenant\Controllers\TenantSettingsController::class, 'show']);
        Route::put('/tenant/settings', [\App\Modules\Tenant\Controllers\TenantSettingsController::class, 'update']);
        Route::get('/onboarding/status', [\App\Modules\Tenant\Controllers\OnboardingController::class, 'status']);
        Route::post('/onboarding/step', [\App\Modules\Tenant\Controllers\OnboardingController::class, 'completeStep']);
        Route::post('/onboarding/complete', [\App\Modules\Tenant\Controllers\OnboardingController::class, 'complete']);
    });
});

Route::get('{any}', function () {
    return view('app');
})->where('any', '.*');
