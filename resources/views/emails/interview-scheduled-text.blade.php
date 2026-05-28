Your interview is scheduled

Hi {{ $interview->candidate->name }},

Stage: {{ $interview->stage }}
Role: {{ $interview->jobPosting?->title }}
Date: {{ $interview->scheduled_at->format('M j, Y g:i A') }}
@if($interview->location_type === 'online')
@if($interview->meeting_link)
Meeting: {{ $interview->meeting_link }}
@endif
@else
@if($interview->location_address)
Location / Venue: {{ $interview->location_address }}
@endif
@endif
