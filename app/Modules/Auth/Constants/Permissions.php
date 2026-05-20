<?php

namespace App\Modules\Auth\Constants;

class Permissions
{
    // Roles
    public const ROLE_SUPER_ADMIN = 'Super Admin';
    public const ROLE_TENANT_ADMIN = 'Tenant Admin';
    public const ROLE_HR = 'HR';
    public const ROLE_MANAGER = 'Manager';
    public const ROLE_EMPLOYEE = 'Employee';

    /**
     * Get all roles
     */
    public static function roles(): array
    {
        return [
            self::ROLE_SUPER_ADMIN,
            self::ROLE_TENANT_ADMIN,
            self::ROLE_HR,
            self::ROLE_MANAGER,
            self::ROLE_EMPLOYEE,
        ];
    }
}
