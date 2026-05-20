<?php

namespace App\Modules\Employee\Models;

use App\Modules\Core\Tenancy\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Employee extends Model
{
    use SoftDeletes, BelongsToTenant, HasFactory;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'employee_id',
        'name',
        'email',
        'work_email',
        'phone',
        'department_id',
        'designation_id',
        'joining_date',
        'manager_id',
        'employment_type',
        'status',
        'profile_photo',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function designation()
    {
        return $this->belongsTo(Designation::class);
    }

    /**
     * Get the user account for the employee.
     */
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    /**
     * Get the manager of the employee.
     */
    public function manager()
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    /**
     * Get the subordinates of the employee.
     */
    public function subordinates()
    {
        return $this->hasMany(Employee::class, 'manager_id');
    }
}
