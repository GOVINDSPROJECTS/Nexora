<?php

namespace App\Modules\Employee\Controllers;

use App\Modules\Shared\Controllers\BaseController;
use App\Modules\Employee\Models\Department;
use App\Modules\Employee\Models\Designation;
use App\Modules\Employee\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrgController extends BaseController
{
    public function departments(): JsonResponse
    {
        return $this->success(Department::with('parent')->get());
    }

    public function designations(): JsonResponse
    {
        return $this->success(Designation::with('department')->get());
    }

    public function chart(): JsonResponse
    {
        $employees = Employee::with(['designation', 'department'])
            ->get(['id', 'name', 'manager_id', 'designation_id', 'department_id', 'profile_photo']);

        return $this->success($employees);
    }
}
