import nodemailer from 'nodemailer';

const DEV_MODE = !process.env.SMTP_HOST;

const transporter = DEV_MODE
  ? null
  : nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      ...(process.env.SMTP_USER
        ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }
        : {}),
    });

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
    console.log('\n========== INVITE EMAIL (dev mode — no SMTP configured) ==========');
    console.log(`TO:      ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`LINK:    ${inviteUrl}`);
    console.log('===================================================================\n');
    return;
  }

  await transporter!.sendMail({
    from: process.env.SMTP_FROM ?? 'noreply@pms.app',
    to,
    subject,
    html,
  });
}
