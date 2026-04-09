const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEV_MODE = !RESEND_API_KEY;

export async function sendInviteEmail(opts: {
  to: string;
  inviterName: string;
  orgName: string;
  inviteUrl: string;
}): Promise<void> {
  const { to, inviterName, orgName, inviteUrl } = opts;

  const subject = `You've been invited to join ${orgName} on PMS`;
  const html = `
    <p>Hi,</p>
    <p><strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong>.</p>
    <p>Click the link below to set up your account. This link expires in 7 days.</p>
    <p><a href="${inviteUrl}">${inviteUrl}</a></p>
    <p>If you weren't expecting this, you can ignore this email.</p>
  `;

  if (DEV_MODE) {
    console.log('\n========== INVITE EMAIL (dev mode — no RESEND_API_KEY configured) ==========');
    console.log(`TO:      ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`LINK:    ${inviteUrl}`);
    console.log('==============================================================================\n');
    return;
  }

  const from = process.env.SMTP_FROM ?? 'onboarding@resend.dev';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Resend API error: ${res.status} ${error}`);
  }
}
