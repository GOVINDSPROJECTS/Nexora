<?php

namespace App\Modules\ATS\Services;

use App\Modules\ATS\Models\Candidate;
use App\Modules\ATS\Models\CandidateActivity;
use Illuminate\Support\Facades\Auth;

class CandidateActivityService
{
    public function log(Candidate $candidate, string $type, string $description, array $properties = []): CandidateActivity
    {
        return CandidateActivity::create([
            'tenant_id' => $candidate->tenant_id,
            'candidate_id' => $candidate->id,
            'user_id' => Auth::id(),
            'type' => $type,
            'description' => $description,
            'properties' => $properties,
        ]);
    }

    public function logStageChange(Candidate $candidate, string $from, string $to): CandidateActivity
    {
        return $this->log($candidate, 'status_change', "Stage changed from {$from} to {$to}", [
            'from' => $from,
            'to' => $to,
        ]);
    }

    public function addNote(Candidate $candidate, string $note): CandidateActivity
    {
        return $this->log($candidate, 'note', $note);
    }
}
