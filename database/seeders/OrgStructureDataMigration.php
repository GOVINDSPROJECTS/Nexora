<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\Employee\Models\Employee;
use App\Modules\Employee\Models\Department;
use App\Modules\Employee\Models\Designation;
use Illuminate\Support\Facades\DB;

class OrgStructureDataMigration extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $employees = Employee::all();

            foreach ($employees as $employee) {
                if ($employee->old_department) {
                    $department = Department::firstOrCreate([
                        'tenant_id' => $employee->tenant_id,
                        'name' => $employee->old_department,
                    ]);
                    $employee->department_id = $department->id;
                }

                if ($employee->old_designation) {
                    $designation = Designation::firstOrCreate([
                        'tenant_id' => $employee->tenant_id,
                        'name' => $employee->old_designation,
                        'department_id' => $employee->department_id,
                    ]);
                    $employee->designation_id = $designation->id;
                }

                $employee->save();
            }
        });
    }
}
