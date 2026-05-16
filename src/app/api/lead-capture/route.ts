// clientside/src/app/api/lead-capture/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { branding } from "@/config/branding";
import { config } from "@/config/config";

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: { user: config.smtpUser, pass: config.smtpPass },
    });

    const roleLabel = "Demo Access";
    const appName = branding.devName;

    // ── Notify sales team ──────────────────────────────────────────────────
    await transporter.sendMail({
      from: `"${appName}" <${config.smtpUser}>`,
      to: config.notifyEmail,
      subject: `New Demo Lead — ${email}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>New Lead — ${appName}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;
             font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
             Roboto,Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="500" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border-radius:8px;
                       border:1px solid #e5e7eb;overflow:hidden;">

          <tr>
            <td style="padding:20px 32px;border-bottom:1px solid #e5e7eb;">
              <span style="font-size:15px;font-weight:700;color:#111827;">
                ${appName}
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 20px;display:inline-block;padding:4px 12px;
                        border-radius:999px;background:#fef3c7;border:1px solid #fde68a;
                        font-size:12px;font-weight:600;color:#92400e;
                        letter-spacing:0.04em;text-transform:uppercase;">
                New Lead
              </p>

              <div style="background:#f9fafb;border-radius:6px;
                          border:1px solid #e5e7eb;padding:18px 22px;">
                <p style="margin:0 0 12px;font-size:11px;font-weight:600;
                          color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">
                  Lead Details
                </p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;font-size:13px;color:#6b7280;
                               white-space:nowrap;padding-right:24px;">Email</td>
                    <td style="padding:8px 0;font-size:13px;color:#111827;
                               font-weight:500;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:13px;color:#6b7280;
                               white-space:nowrap;padding-right:24px;">Source</td>
                    <td style="padding:8px 0;font-size:13px;color:#111827;
                               font-weight:500;">${source || "Demo Email Gate"}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:13px;color:#6b7280;
                               white-space:nowrap;padding-right:24px;">Timestamp</td>
                    <td style="padding:8px 0;font-size:13px;color:#111827;
                               font-weight:500;">${new Date().toISOString()}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
                ${appName} Lead Notification · Internal Use Only
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    // ── Send demo access email to lead ─────────────────────────────────────
    await transporter.sendMail({
      from: `"${appName}" Demo <${config.smtpUser}>`,
      to: email,
      subject: `Your ${appName} Demo Access`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Demo Access — ${appName}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;
             font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
             Roboto,Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border-radius:8px;
                       border:1px solid #e5e7eb;overflow:hidden;">

          <tr>
            <td style="padding:20px 32px;border-bottom:1px solid #e5e7eb;">
              <span style="font-size:15px;font-weight:700;color:#111827;">
                ${appName}
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 32px 28px;">
              <p style="margin:0 0 20px;display:inline-block;padding:4px 12px;
                        border-radius:999px;background:#f0fdf4;border:1px solid #bbf7d0;
                        font-size:12px;font-weight:600;color:#15803d;
                        letter-spacing:0.04em;text-transform:uppercase;">
                ${roleLabel}
              </p>

              <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">
                Thank you for your interest in <strong style="color:#111827;">${appName}</strong>.
                You now have full access to the interactive demo.
              </p>

              <div style="background:#f9fafb;border-radius:6px;
                          border:1px solid #e5e7eb;padding:18px 22px;
                          margin-bottom:28px;">
                <p style="margin:0 0 12px;font-size:11px;font-weight:600;
                          color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">
                  What's Included
                </p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;font-size:13px;color:#6b7280;
                               white-space:nowrap;padding-right:24px;">Access</td>
                    <td style="padding:8px 0;font-size:13px;color:#111827;
                               font-weight:500;">Full interactive demo</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:13px;color:#6b7280;
                               white-space:nowrap;padding-right:24px;">Duration</td>
                    <td style="padding:8px 0;font-size:13px;color:#111827;
                               font-weight:500;">Unlimited exploration</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:13px;color:#6b7280;
                               white-space:nowrap;padding-right:24px;">Support</td>
                    <td style="padding:8px 0;font-size:13px;color:#111827;
                               font-weight:500;">${branding.supportEmail}</td>
                  </tr>
                </table>
              </div>

              
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 6px;font-size:11px;color:#9ca3af;text-align:center;">
                Questions? Reply to this email or contact us at
                ${branding.supportEmail}
              </p>
              <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
                ${appName} · Demo Access · Authorized use only
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[lead-capture]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}