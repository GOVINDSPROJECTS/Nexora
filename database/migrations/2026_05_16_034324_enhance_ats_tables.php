<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update candidates table
        Schema::table('candidates', function (Blueprint $table) {
            $table->string('current_stage')->default('Applied')->after('status'); // Applied, Screening, Technical Round, HR Round, Final Round, Selected, Rejected
            $table->integer('rating')->nullable()->after('current_stage');
        });

        // Create interviews table
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('candidate_id')->constrained('candidates')->onDelete('cascade');
            $table->foreignId('job_posting_id')->constrained('job_postings')->onDelete('cascade');
            $table->foreignId('interviewer_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('stage'); // Screening, Technical Round, etc.
            $table->dateTime('scheduled_at');
            $table->string('status')->default('scheduled'); // scheduled, completed, cancelled
            $table->text('feedback')->nullable();
            $table->integer('rating')->nullable();
            $table->string('meeting_link')->nullable(); // For Integration (Google Meet, etc.)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interviews');
        
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropColumn(['current_stage', 'rating']);
        });
    }
};
