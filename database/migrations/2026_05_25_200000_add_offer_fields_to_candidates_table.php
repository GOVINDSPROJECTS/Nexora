<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->foreignId('manager_id')->nullable()->after('rating')->constrained('employees')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->after('manager_id')->constrained('departments')->nullOnDelete();
            $table->foreignId('designation_id')->nullable()->after('department_id')->constrained('designations')->nullOnDelete();
            $table->date('joining_date')->nullable()->after('designation_id');
            $table->string('employment_type')->nullable()->after('joining_date');
            $table->decimal('offered_salary', 15, 2)->nullable()->after('employment_type');
            $table->string('offer_token', 80)->nullable()->unique()->after('offered_salary');
            $table->timestamp('offer_sent_at')->nullable()->after('offer_token');
            $table->timestamp('offer_accepted_at')->nullable()->after('offer_sent_at');
            $table->timestamp('offer_declined_at')->nullable()->after('offer_accepted_at');
        });
    }

    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropForeign(['manager_id']);
            $table->dropForeign(['department_id']);
            $table->dropForeign(['designation_id']);
            $table->dropColumn([
                'manager_id', 'department_id', 'designation_id', 'joining_date',
                'employment_type', 'offered_salary', 'offer_token',
                'offer_sent_at', 'offer_accepted_at', 'offer_declined_at'
            ]);
        });
    }
};
