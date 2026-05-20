<?php

use App\Modules\Tenant\Models\Tenant;
use App\Modules\Leave\Models\LeaveRequest;
use App\Modules\Core\Tenancy\TenantManager;

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tenant = Tenant::find(1);
if (!$tenant) {
    echo "Tenant 1 not found\n";
    exit;
}

app(TenantManager::class)->setTenant($tenant);

echo "Tenant ID: " . app(TenantManager::class)->getTenantId() . "\n";
echo "Pending Leaves: " . LeaveRequest::where('status', 'pending')->count() . "\n";
echo "Total Leaves (ignore scope): " . LeaveRequest::withoutGlobalScope('tenant')->count() . "\n";
