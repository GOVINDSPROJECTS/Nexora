<?php

/**
 * Nexora Phase 3 E2E API smoke test (session-based, mirrors SPA flows).
 * Run: php tests/e2e_api_test.php
 */

$base = getenv('APP_URL') ?: 'http://127.0.0.1:8000';
$api = rtrim($base, '/') . '/api/v1';
$cookieFile = sys_get_temp_dir() . '/nexora_e2e_cookies.txt';
@unlink($cookieFile);

$results = [];
$failures = [];

function request(string $method, string $url, ?array $body = null, bool $json = true): array
{
    global $cookieFile;
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_COOKIEJAR => $cookieFile,
        CURLOPT_COOKIEFILE => $cookieFile,
        CURLOPT_HEADER => true,
        CURLOPT_HTTPHEADER => array_filter([
            'Accept: application/json',
            $body !== null ? 'Content-Type: application/json' : null,
        ]),
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    $raw = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);
    $responseBody = substr($raw, $headerSize);
    $decoded = json_decode($responseBody, true);

    return ['code' => $code, 'body' => $decoded, 'raw' => $responseBody];
}

function test(string $name, callable $fn): void
{
    global $results, $failures;
    try {
        $fn();
        $results[] = ['name' => $name, 'status' => 'PASS'];
        echo "PASS: $name\n";
    } catch (Throwable $e) {
        $results[] = ['name' => $name, 'status' => 'FAIL', 'error' => $e->getMessage()];
        $failures[] = $name . ': ' . $e->getMessage();
        echo "FAIL: $name — {$e->getMessage()}\n";
    }
}

function assertTrue(bool $cond, string $msg): void
{
    if (!$cond) {
        throw new RuntimeException($msg);
    }
}

function assertCode(int $expected, array $res, string $ctx = ''): void
{
    assertTrue($res['code'] === $expected, "$ctx expected HTTP $expected, got {$res['code']}: " . substr($res['raw'] ?? '', 0, 200));
}

echo "=== Nexora E2E API Tests ===\nBase: $api\n\n";

test('Health check', function () use ($api) {
    $r = request('GET', "$api/health");
    assertCode(200, $r);
    assertTrue(($r['body']['success'] ?? false) === true, 'success flag');
    assertTrue(($r['body']['data']['status'] ?? '') === 'healthy', 'db healthy');
});

test('Login', function () use ($api) {
    $r = request('POST', "$api/login", ['email' => 'admin@nexora.com', 'password' => 'password']);
    assertCode(200, $r);
    assertTrue(isset($r['body']['data']['user']['id']), 'user returned');
});

test('Auth user', function () use ($api) {
    $r = request('GET', "$api/user");
    assertCode(200, $r);
    assertTrue($r['body']['data']['email'] === 'admin@nexora.com', 'email match');
});

test('Dashboard stats', function () use ($api) {
    $r = request('GET', "$api/dashboard/stats");
    assertCode(200, $r);
    assertTrue(isset($r['body']['data']['total_employees']), 'stats keys');
});

test('Dashboard summary', function () use ($api) {
    $r = request('GET', "$api/dashboard/summary");
    assertCode(200, $r);
    assertTrue(isset($r['body']['data']['hiring_funnel']), 'hiring funnel');
});

test('Employees list', function () use ($api) {
    $r = request('GET', "$api/employees");
    assertCode(200, $r);
    assertTrue($r['body']['success'] === true, 'success');
});

test('Leave types', function () use ($api) {
    $r = request('GET', "$api/leave/types");
    assertCode(200, $r);
});

test('Leaves list', function () use ($api) {
    $r = request('GET', "$api/leaves");
    assertCode(200, $r);
});

test('Tasks list', function () use ($api) {
    $r = request('GET', "$api/tasks");
    assertCode(200, $r);
});

test('Jobs list', function () use ($api) {
    $r = request('GET', "$api/jobs");
    assertCode(200, $r);
});

test('Candidates list (all)', function () use ($api) {
    $r = request('GET', "$api/candidates?all=1");
    assertCode(200, $r);
    assertTrue(is_array($r['body']['data']), 'candidates array');
});

test('Create candidate', function () use ($api) {
    global $createdCandidateId, $jobId;
    $jobs = request('GET', "$api/jobs");
    $jobId = $jobs['body']['data']['data'][0]['id'] ?? $jobs['body']['data'][0]['id'] ?? null;
    assertTrue($jobId !== null, 'job id for candidate');
    $r = request('POST', "$api/candidates", [
        'job_posting_id' => $jobId,
        'name' => 'E2E Test Candidate',
        'email' => 'e2e.' . time() . '@test.com',
        'phone' => '555-0100',
    ]);
    assertCode(201, $r);
    $createdCandidateId = $r['body']['data']['id'] ?? $r['body']['data']['data']['id'] ?? null;
    assertTrue($createdCandidateId !== null, 'candidate id');
});

test('Update candidate stage', function () use ($api) {
    global $createdCandidateId;
    $r = request('PUT', "$api/candidates/$createdCandidateId", ['current_stage' => 'Screening']);
    assertCode(200, $r);
});

test('Candidate activities', function () use ($api) {
    global $createdCandidateId;
    $r = request('GET', "$api/candidates/$createdCandidateId/activities");
    assertCode(200, $r);
});

test('Add candidate note', function () use ($api) {
    global $createdCandidateId;
    $r = request('POST', "$api/candidates/$createdCandidateId/notes", ['note' => 'E2E note from tester']);
    assertCode(201, $r);
});

test('Schedule interview', function () use ($api) {
    global $createdCandidateId, $jobId;
    $r = request('POST', "$api/interviews", [
        'candidate_id' => $createdCandidateId,
        'job_posting_id' => $jobId,
        'stage' => 'Technical Round',
        'scheduled_at' => date('c', strtotime('+2 days')),
    ]);
    assertCode(201, $r);
    assertTrue(!empty($r['body']['data']['meeting_link']), 'meeting link');
});

test('Interviews list', function () use ($api) {
    $r = request('GET', "$api/interviews");
    assertCode(200, $r);
});

test('Workflows list', function () use ($api) {
    $r = request('GET', "$api/workflows");
    assertCode(200, $r);
    assertTrue(count($r['body']['data'] ?? []) > 0, 'workflows seeded');
});

test('Notifications', function () use ($api) {
    $r = request('GET', "$api/notifications");
    assertCode(200, $r);
    assertTrue(isset($r['body']['data']['items']), 'paginated notifications');
});

test('Notification preferences', function () use ($api) {
    $r = request('GET', "$api/notifications/preferences");
    assertCode(200, $r);
    $r2 = request('PUT', "$api/notifications/preferences", [
        'preferences' => [
            ['category' => 'ats', 'in_app' => true, 'email' => false],
        ],
    ]);
    assertCode(200, $r2);
});

test('Tenant settings', function () use ($api) {
    $r = request('GET', "$api/tenant/settings");
    assertCode(200, $r);
    $r2 = request('PUT', "$api/tenant/settings", [
        'branding' => ['primary_color' => '#2563eb', 'accent_color' => '#10b981', 'company_tagline' => 'E2E'],
    ]);
    assertCode(200, $r2);
});

test('Onboarding status', function () use ($api) {
    $r = request('GET', "$api/onboarding/status");
    assertCode(200, $r);
    assertTrue(isset($r['body']['data']['progress']), 'progress');
});

test('Pipeline summary', function () use ($api) {
    $r = request('GET', "$api/candidates/pipeline-summary");
    assertCode(200, $r);
});

test('Attendance', function () use ($api) {
    $r = request('GET', "$api/attendance");
    assertCode(200, $r);
});

test('Hiring funnel report', function () use ($api) {
    $r = request('GET', "$api/reports/hiring-funnel");
    assertCode(200, $r);
});

test('SPA shell loads', function () use ($base) {
    $ch = curl_init(rtrim($base, '/') . '/dashboard');
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true]);
    $html = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    assertTrue($code === 200, "dashboard page HTTP $code");
    assertTrue(str_contains($html, 'id="app"'), 'react mount point');
});

test('Logout', function () use ($api) {
    $r = request('POST', "$api/logout");
    assertCode(200, $r);
});

test('Mobile token auth', function () use ($api, $cookieFile) {
    @unlink($cookieFile);
    $r = request('POST', "$api/auth/token", ['email' => 'admin@nexora.com', 'password' => 'password']);
    assertCode(200, $r);
    assertTrue(!empty($r['body']['data']['token']), 'bearer token');
});

echo "\n=== Summary ===\n";
$passed = count(array_filter($results, fn ($r) => $r['status'] === 'PASS'));
$failed = count($failures);
echo "Passed: $passed / " . count($results) . "\n";
if ($failed > 0) {
    echo "Failures:\n";
    foreach ($failures as $f) {
        echo "  - $f\n";
    }
    exit(1);
}
echo "All tests passed.\n";
