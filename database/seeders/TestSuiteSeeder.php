<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Modules\Tenant\Models\Tenant;
use App\Modules\Employee\Models\Employee;
use App\Modules\Employee\Models\Department;
use App\Modules\Employee\Models\Designation;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class TestSuiteSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Test Tenant
        $tenant = Tenant::updateOrCreate(
            ['domain' => 'test.nexora.com'],
            ['name' => 'Test Corp']
        );

        // 2. Setup Roles (Standard Roles)
        $roles = ['Tenant Admin', 'HR', 'Manager', 'Employee'];
        foreach ($roles as $roleName) {
            Role::findOrCreate($roleName, 'web');
        }

        // 3. Setup Org Structure
        $engineering = Department::firstOrCreate([
            'tenant_id' => $tenant->id,
            'name' => 'Engineering',
            'code' => 'ENG'
        ]);

        $ctoDesignation = Designation::firstOrCreate([
            'tenant_id' => $tenant->id,
            'name' => 'CTO',
            'department_id' => $engineering->id
        ]);

        $mgrDesignation = Designation::firstOrCreate([
            'tenant_id' => $tenant->id,
            'name' => 'Engineering Manager',
            'department_id' => $engineering->id
        ]);

        $engDesignation = Designation::firstOrCreate([
            'tenant_id' => $tenant->id,
            'name' => 'Senior Developer',
            'department_id' => $engineering->id
        ]);

        // 4. Create Users and Employees
        
        // Admin
        $adminUser = $this->createUser($tenant, 'Admin User', 'admin@test.com', 'Tenant Admin');
        Employee::updateOrCreate(['email' => 'admin@test.com'], [
            'tenant_id' => $tenant->id,
            'user_id' => $adminUser->id,
            'name' => 'Admin User',
            'designation_id' => $ctoDesignation->id,
            'department_id' => $engineering->id,
            'status' => 'active'
        ]);

        // Manager
        $mgrUser = $this->createUser($tenant, 'Manager Mike', 'manager@test.com', 'Manager');
        $manager = Employee::updateOrCreate(['email' => 'manager@test.com'], [
            'tenant_id' => $tenant->id,
            'user_id' => $mgrUser->id,
            'name' => 'Manager Mike',
            'designation_id' => $mgrDesignation->id,
            'department_id' => $engineering->id,
            'status' => 'active'
        ]);

        // Employee (Under Manager)
        $empUser = $this->createUser($tenant, 'Employee Eric', 'employee@test.com', 'Employee');
        Employee::updateOrCreate(['email' => 'employee@test.com'], [
            'tenant_id' => $tenant->id,
            'user_id' => $empUser->id,
            'name' => 'Employee Eric',
            'designation_id' => $engDesignation->id,
            'department_id' => $engineering->id,
            'manager_id' => $manager->id,
            'status' => 'active'
        ]);
    }

    private function createUser($tenant, $name, $email, $role)
    {
        $user = User::updateOrCreate(['email' => $email], [
            'tenant_id' => $tenant->id,
            'name' => $name,
            'password' => Hash::make('password'),
            'status' => 'active'
        ]);
        $user->syncRoles([$role]);
        return $user;
    }
}
