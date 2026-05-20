<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; line-height: 1.6;">
    <h2>Application received</h2>
    <p>Hi {{ $candidateName }},</p>
    <p>Thank you for applying for <strong>{{ $job->title }}</strong>. Our team will review your application and contact you if you are shortlisted.</p>
    <p>{{ config('app.name') }}</p>
</body>
</html>
