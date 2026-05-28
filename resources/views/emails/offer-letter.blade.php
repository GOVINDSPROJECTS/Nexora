<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Employment Offer Letter</h2>
    <p>Hi {{ $candidate->name }},</p>
    <p>We are delighted to offer you employment at Nexora! We were incredibly impressed by your interviews and background.</p>
    <p>Please review the details of your offer and accept or decline by clicking the button below:</p>
    <p style="margin: 30px 0; text-align: center;">
        <a href="{{ $offerUrl }}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View & Respond to Offer</a>
    </p>
    <p>If you have any questions, feel free to reply to this email.</p>
    <p>Best regards,<br>The Hiring Team</p>
</body>
</html>
