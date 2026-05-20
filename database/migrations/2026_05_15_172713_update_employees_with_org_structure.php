<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Rename old columns to preserve data for migration
            $table->renameColumn('department', 'old_department');
            $table->renameColumn('designation', 'old_designation');
            
            // Add new FK columns
            $table->foreignId('department_id')->nullable()->after('tenant_id')->constrained('departments')->onDelete('set null');
            $table->foreignId('designation_id')->nullable()->after('department_id')->constrained('designations')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['designation_id']);
            $table->dropColumn(['department_id', 'designation_id']);
            
            $table->renameColumn('old_department', 'department');
            $table->renameColumn('old_designation', 'designation');
        });
    }
};
