# Admin Settings Subpage

This page allows administrators to manage their account security, profile information, and system-wide admin preferences.

## Admin Account Management

Account security:

- **Change username:** update the admin login username with verification of current password
- **Change password:** enforce strong password requirements (minimum 12 characters, uppercase, lowercase, numbers, special characters)
- **Password history:** prevent reuse of the last 5 passwords
- **Two-factor authentication (2FA):** enable/disable optional 2FA using authenticator apps (Google Authenticator, Microsoft Authenticator)
- **Active sessions:** view and terminate active login sessions across devices

Admin profile information:

- **Full name (Arabic and English):** admin's display name
- **Email address:** contact email for account recovery and notifications
- **Phone number (optional):** for additional account recovery options
- **Profile picture (optional):** avatar or profile image

Notification preferences:

- Email notifications for new contact form submissions
- Email notifications for new module uploads pending approval
- Email notifications for critical system alerts or errors
- Notification frequency (immediate, daily digest, weekly summary)

System preferences:

- **Dashboard refresh rate:** set auto-refresh interval for dashboard widgets (disabled, 30s, 60s, 5m, 15m)
- **Default language:** system UI language preference (Arabic or English, currently Arabic-only)
- **Timezone:** for consistent timestamp display across the admin panel
- **Audit log retention:** duration to keep admin activity logs (30 days, 90 days, 1 year, unlimited)

## Portfolio Engineer Public Profile

Portfolio engineer contact details (displayed on public site):

- **Full name (Arabic and English):** engineer/designer display name
- **Phone number:** direct contact phone
- **WhatsApp number:** WhatsApp contact link or number
- **LinkedIn profile:** LinkedIn URL or username
- **Email address:** professional email for inquiries
- **Bio/Professional summary:** short description and expertise areas
- **Profile photo:** professional headshot

## Contact Form & Visitor Management

Contact form management:

- **View all contact submissions:** list of all messages from visitors with timestamp, name, email, subject, and message content
- **Message status:** mark as read/unread, open/resolved
- **Reply to contact forms:** send direct responses to visitor inquiries via email
- **Export messages:** download contact submissions as CSV or PDF for archival
- **Contact form settings:** enable/disable the contact form on the public site, set auto-reply message

Visitor inquiry dashboard:

- **Unread message count:** badge showing pending inquiries
- **Message threads:** organize and track ongoing conversations
- **Auto-response message:** configure automatic reply text when visitors submit the form
- **Notification alerts:** email admin new contact submissions in real-time (optional)

## Security & Compliance

- **View login history:** timestamp, IP address, device, and location of all sign-in attempts
- **View audit trail:** complete log of all admin actions (module uploads, edits, deletions, user management)
- **Logout all sessions:** immediately terminate all active sessions across all devices
- **Delete account (admin only):** irreversible account deletion with data archival

Developer notes:

- All password changes must be hashed using bcrypt or similar before storage.
- 2FA codes must be time-based OTP (TOTP) with standard 30-second intervals.
- All security-sensitive changes (password, 2FA, sessions) must trigger email confirmation.
- Contact form submissions must be validated, sanitized, and rate-limited to prevent spam and abuse.
- Maintain complete audit logs of all settings changes and contact submissions for compliance and forensics.
- API rate-limit profile, password, and contact endpoints to prevent brute-force attacks.
