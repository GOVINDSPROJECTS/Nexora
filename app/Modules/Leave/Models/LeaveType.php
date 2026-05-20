<?php

namespace App\Modules\Leave\Models;

use App\Modules\Core\Tenancy\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    use BelongsToTenant;
    protected $fillable = ['tenant_id', 'name', 'days_per_year'];
}
