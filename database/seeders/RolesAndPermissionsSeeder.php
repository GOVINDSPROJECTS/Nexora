<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Modules\Auth\Constants\Permissions;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Roles
        foreach (Permissions::roles() as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        // Example Permissions
        $permissions = [
            'view dashboard',
            'manage tenants',
            'manage employees',
            'manage leave',
            'manage attendance',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign all permissions to Super Admin
        $superAdmin = Role::where('name', Permissions::ROLE_SUPER_ADMIN)->first();
        $superAdmin->givePermissionTo(Permission::all());
    }
}
