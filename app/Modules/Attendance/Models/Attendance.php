<?php

namespace App\Modules\Attendance\Models;

use App\Modules\Core\Tenancy\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'employee_id', 'date', 'clock_in', 'clock_out', 'status', 'ip_address'
    ];

    public function employee() {
        return $this->belongsTo(\App\Modules\Employee\Models\Employee::class);
    }
}
