<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Tenant\Models\Tenant;
use App\Modules\Employee\Models\Employee;
use App\Modules\Leave\Models\LeaveType;
use App\Modules\ATS\Models\JobPosting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Modules\Auth\Constants\Permissions;

class InitialDataSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 0. Create Roles
        $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => Permissions::ROLE_TENANT_ADMIN, 'guard_name' => 'web']);
        $hrRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => Permissions::ROLE_HR, 'guard_name' => 'web']);
        $managerRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => Permissions::ROLE_MANAGER, 'guard_name' => 'web']);
        $employeeRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => Permissions::ROLE_EMPLOYEE, 'guard_name' => 'web']);

        // 1. Create a Demo Tenant
        $tenant = Tenant::create([
            'name' => 'Nexora Demo Corp',
            'subdomain' => 'demo',
            'contact_email' => 'admin@nexora.demo',
            'timezone' => 'UTC',
        ]);

        // 2. Create Users for each role
        // Tenant Admin
        $admin = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'System Admin',
            'email' => 'admin@nexora.com',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);
        $admin->assignRole($adminRole);

        // HR User
        $hr = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Sarah HR',
            'email' => 'hr@nexora.com',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);
        $hr->assignRole($hrRole);

        // Manager User
        $managerUser = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Robert Manager',
            'email' => 'manager@nexora.com',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);
        $managerUser->assignRole($managerRole);

        // Basic Employee User
        $empUser = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'John Employee',
            'email' => 'employee@nexora.com',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);
        $empUser->assignRole($employeeRole);

        // 3. Create Leave Types
        $leaveTypes = [
            ['name' => 'Sick Leave', 'days_per_year' => 12],
            ['name' => 'Annual Leave', 'days_per_year' => 20],
            ['name' => 'Casual Leave', 'days_per_year' => 10],
        ];

        foreach ($leaveTypes as $type) {
            LeaveType::create(array_merge($type, ['tenant_id' => $tenant->id]));
        }

        // 4. Create Sample Employees
        $employees = [
            [
                'user_id' => $empUser->id,
                'name' => 'John Employee',
                'email' => 'employee@nexora.com',
                'employee_id' => 'NX-001',
                'department' => 'Engineering',
                'designation' => 'Senior Developer',
                'status' => 'active',
                'employment_type' => 'full-time',
            ],
            [
                'user_id' => $hr->id,
                'name' => 'Sarah HR',
                'email' => 'hr@nexora.com',
                'employee_id' => 'NX-002',
                'department' => 'HR',
                'designation' => 'HR Manager',
                'status' => 'active',
                'employment_type' => 'full-time',
            ],
            [
                'user_id' => $managerUser->id,
                'name' => 'Robert Manager',
                'email' => 'manager@nexora.com',
                'employee_id' => 'NX-003',
                'department' => 'Engineering',
                'designation' => 'Tech Lead',
                'status' => 'active',
                'employment_type' => 'full-time',
            ],
        ];

        foreach ($employees as $emp) {
            Employee::create(array_merge($emp, ['tenant_id' => $tenant->id]));
        }

        // 5. Create Sample Job Postings
        $jobs = [
            [
                'title' => 'Frontend Engineer (React)',
                'department' => 'Engineering',
                'location' => 'Remote',
                'status' => 'published',
            ],
            [
                'title' => 'Product Manager',
                'department' => 'Product',
                'location' => 'New York, NY',
                'status' => 'published',
            ],
        ];

        foreach ($jobs as $job) {
            JobPosting::create(array_merge($job, ['tenant_id' => $tenant->id]));
        }

        $this->call(WorkflowSeeder::class);
    }
}
