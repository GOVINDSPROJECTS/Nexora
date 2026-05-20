<?php

namespace App\Modules\Core\Controllers;

use App\Modules\Shared\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

class HealthController extends BaseController
{
    public function index(): JsonResponse
    {
        $dbStatus = false;
        try {
            DB::connection()->getPdo();
            $dbStatus = true;
        } catch (\Exception) {
            $dbStatus = false;
        }

        $cacheStatus = false;
        try {
            Cache::put('health_check', true, 10);
            $cacheStatus = Cache::get('health_check') === true;
        } catch (\Exception) {
            $cacheStatus = false;
        }

        $queueConnection = config('queue.default');
        $healthy = $dbStatus;

        return $this->success([
            'status' => $healthy ? 'healthy' : 'degraded',
            'timestamp' => now()->toIso8601String(),
            'version' => config('app.version', '3.0.0'),
            'services' => [
                'database' => $dbStatus ? 'connected' : 'disconnected',
                'cache' => $cacheStatus ? 'connected' : 'disconnected',
                'queue' => $queueConnection,
            ],
        ], 'System Health Check');
    }

    public function diagnostics(): JsonResponse
    {
        return $this->success([
            'php' => PHP_VERSION,
            'laravel' => app()->version(),
            'environment' => app()->environment(),
            'timezone' => config('app.timezone'),
            'broadcast_driver' => config('broadcasting.default'),
        ]);
    }
}
