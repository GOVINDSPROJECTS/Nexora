<?php

namespace App\Modules\Reporting\Support;

use Illuminate\Support\Facades\DB;

class ReportDateSql
{
    public static function monthYear(string $column): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%b %Y', {$column})",
            'pgsql' => "TO_CHAR({$column}, 'Mon YYYY')",
            default => "DATE_FORMAT({$column}, '%b %Y')",
        };
    }

    public static function month(string $column): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%b', {$column})",
            'pgsql' => "TO_CHAR({$column}, 'Mon')",
            default => "DATE_FORMAT({$column}, '%b')",
        };
    }

    public static function date(string $column): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "date({$column})",
            'pgsql' => "DATE({$column})",
            default => "DATE({$column})",
        };
    }
}
