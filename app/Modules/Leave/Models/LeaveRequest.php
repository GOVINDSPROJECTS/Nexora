<?php

namespace App\Modules\Leave\Models;

use App\Modules\Core\Tenancy\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use BelongsToTenant;
    protected $fillable = [
        'tenant_id', 'employee_id', 'leave_type_id', 'start_date', 'end_date', 
        'status', 'reason', 'admin_comment', 'approved_by'
    ];

    public function employee() {
        return $this->belongsTo(\App\Modules\Employee\Models\Employee::class);
    }

    public function leaveType() {
        return $this->belongsTo(LeaveType::class);
    }
}
