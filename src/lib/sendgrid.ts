import { APP_CONFIG } from "@/lib/app-config";
import sgMail from "@sendgrid/mail";
import { ORGANIZER_NAME, SITE_NAME } from "@/lib/site";

type SendMagicLinkArgs = {
  to: string;
  magicLink: string;
  recipientName?: string;
  expiresInLabel?: string;
  eventTitle?: string;
};

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = APP_CONFIG.SENDGRID_FROM_EMAIL;
// Preserve sandbox behavior unless real delivery is explicitly enabled.
const sandboxMode = process.env.SENDGRID_SANDBOX_MODE?.trim().toLowerCase() !== "false";

if (apiKey) {
  sgMail.setApiKey(apiKey);
}

export async function sendMagicLinkEmail({
  to,
  magicLink,
  recipientName,
  expiresInLabel,
  eventTitle,
}: SendMagicLinkArgs) {
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not set");
  }

  const title = eventTitle ?? SITE_NAME;
  const name = recipientName?.trim() || "there";
  const expiry = expiresInLabel ?? "90 days";
  const escapeHtml = (value: string) =>
    value.replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character]!,
    );

  const email = {
    from: {
      email: fromEmail,
      name: ORGANIZER_NAME,
    },
    to,
    subject: `Your ${title} access link`,
    text: `Hi ${name},\n\nOpen your speaker portal: ${magicLink}\n\nThis link expires in ${expiry}.\n\n${ORGANIZER_NAME}`,
    html: `<div style="background:#000;color:#fff;font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 32px"><p style="color:#14f195;font-size:12px;letter-spacing:.12em;text-transform:uppercase">${escapeHtml(title)} / Speaker access</p><h1 style="font-size:30px;line-height:1.1;margin:32px 0 20px">Your speaker portal</h1><p style="color:#c0c0c0;line-height:1.5">Hi ${escapeHtml(name)},<br>Open your private portal to see your sessions and speaker information.</p><p style="margin:32px 0"><a href="${escapeHtml(magicLink)}" style="display:inline-block;background:#14f195;color:#000;padding:14px 20px;font-weight:bold;text-decoration:none">Open speaker portal</a></p><p style="color:#a2a2a2;font-size:13px">This link expires in ${escapeHtml(expiry)}. If you did not request it, you can ignore this email.</p></div>`,
    mailSettings: sandboxMode
      ? {
          sandboxMode: {
            enable: true,
          },
        }
      : undefined,
  };

  await sgMail.send(email);
}
