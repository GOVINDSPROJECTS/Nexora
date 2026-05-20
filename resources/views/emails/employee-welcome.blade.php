<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; line-height: 1.6;">
    <h2>Welcome to the team</h2>
    <p>Hi {{ $employee->name }},</p>
    <p>Your employee profile has been created.</p>
    @if($employee->work_email)
        <p><strong>Work email:</strong> {{ $employee->work_email }}</p>
    @endif
    @if($temporaryPassword)
        <p><strong>Login email:</strong> {{ $employee->email }}<br>
        <strong>Temporary password:</strong> {{ $temporaryPassword }}</p>
    @endif
    <p>{{ config('app.name') }}</p>
</body>
</html>
