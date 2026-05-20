<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; line-height: 1.6;">
    <h2>New candidate application</h2>
    <p><strong>{{ $candidate->name }}</strong> applied for <strong>{{ $job->title }}</strong>.</p>
    <p>Email: {{ $candidate->email }}<br>
    @if($candidate->phone) Phone: {{ $candidate->phone }}<br>@endif
    Stage: {{ $candidate->current_stage }}</p>
    <p>Review applications in your Nexora dashboard.</p>
</body>
</html>
