import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

interface MailConfig {
  host: string | null;
  port: number;
  secure: boolean;
  user: string | null;
  pass: string | null;
  from: string;
}

/**
 * Thin wrapper around nodemailer for outbound transactional email (currently
 * just the forgot-password email, which carries a newly generated password).
 * When SMTP isn't configured (no SMTP_HOST/SMTP_USER/SMTP_PASS — the common
 * case in local dev), it falls back to logging the email content to the
 * server console instead of sending it, so the app still works without real
 * credentials. That log line is server-side only — it is never returned in
 * an API response, so the password is never exposed to the client.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;

  constructor(private readonly configService: ConfigService) {
    const mail = this.configService.get<MailConfig>('mail')!;
    if (mail.host && mail.user && mail.pass) {
      this.transporter = nodemailer.createTransport({
        host: mail.host,
        port: mail.port,
        secure: mail.secure,
        auth: { user: mail.user, pass: mail.pass },
      });
    } else {
      this.transporter = null;
      this.logger.warn(
        'No SMTP credentials configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — outbound emails will be ' +
          'logged to the server console instead of actually sent. Set them for real delivery.',
      );
    }
  }

  /**
   * Emails `password` — a freshly generated one — to the account owner.
   * Never throws: AuthService.forgotPassword must respond identically
   * whether or not the account exists or the send succeeds, so delivery
   * failures are only logged, not propagated.
   *
   * `accountType` disambiguates for a person who owns both a buyer and a
   * seller account on one email address — otherwise the mail gives no hint
   * which of the two this password is for.
   */
  async sendNewPasswordEmail(
    to: string,
    name: string,
    password: string,
    accountType: string | null,
  ): Promise<void> {
    const label = accountType ? `${accountType} account` : 'account';
    const subject = 'Your new truEstate password';
    const text =
      `Hi ${name},\n\n` +
      `You asked to recover the password for your truEstate ${label} (${to}).\n\n` +
      `Your new password is: ${password}\n\n` +
      'Your previous password no longer works. Log in with the password above, then change it from ' +
      "Settings → Change Password.\n\n" +
      "If you didn't request this, someone else may have — log in and change your password now.";
    const html =
      `<p>Hi ${escapeHtml(name)},</p>` +
      `<p>You asked to recover the password for your truEstate <strong>${escapeHtml(label)}</strong> ` +
      `(${escapeHtml(to)}).</p>` +
      '<p>Your new password is:</p>' +
      `<p style="font-size:1.25rem;font-weight:700;letter-spacing:0.05em;background:#f4f4f5;` +
      `border-radius:0.5rem;padding:0.75rem 1.25rem;display:inline-block;font-family:monospace;">` +
      `${escapeHtml(password)}</p>` +
      '<p>Your previous password no longer works. Log in with the password above, then change it ' +
      'from <strong>Settings → Change Password</strong>.</p>' +
      "<p>If you didn't request this, someone else may have — log in and change your password now.</p>";

    if (!this.transporter) {
      this.logger.log(`[DEV — no SMTP configured] New password for ${to}: ${password}`);
      return;
    }

    try {
      const mail = this.configService.get<MailConfig>('mail')!;
      await this.transporter.sendMail({ from: mail.from, to, subject, text, html });
    } catch (error) {
      this.logger.error(`Failed to email the new password to ${to}: ${(error as Error).message}`);
    }
  }
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return value.replace(/[&<>"']/g, (c) => entities[c]);
}
