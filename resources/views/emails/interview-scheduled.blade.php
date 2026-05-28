<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
    <h2>Your interview is scheduled</h2>
    <p>Hi {{ $interview->candidate->name }},</p>
    <p>You have been scheduled for <strong>{{ $interview->stage }}</strong> for the role <strong>{{ $interview->jobPosting?->title }}</strong>.</p>
    <p><strong>Date & time:</strong> {{ $interview->scheduled_at->format('M j, Y g:i A') }}</p>
    @if($interview->location_type === 'online')
        @if($interview->meeting_link)
            <p><strong>Join meeting:</strong> <a href="{{ $interview->meeting_link }}">{{ $interview->meeting_link }}</a></p>
        @endif
    @else
        @if($interview->location_address)
            <p><strong>Location / Venue:</strong> {!! nl2br(e($interview->location_address)) !!}</p>
        @endif
    @endif
    <p>Good luck!<br>{{ config('app.name') }}</p>
</body>
</html>
