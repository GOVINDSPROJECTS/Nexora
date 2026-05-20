<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_postings', function (Blueprint $table) {
            $table->string('public_slug')->nullable()->unique()->after('status');
            $table->foreignId('created_by')->nullable()->after('tenant_id')->constrained('users')->nullOnDelete();
        });

        Schema::table('candidates', function (Blueprint $table) {
            $table->string('source')->default('manual')->after('status');
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->string('work_email')->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('work_email');
        });

        Schema::table('candidates', function (Blueprint $table) {
            $table->dropColumn('source');
        });

        Schema::table('job_postings', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn(['public_slug', 'created_by']);
        });
    }
};
