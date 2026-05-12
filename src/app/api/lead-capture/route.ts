// src/app/api/lead-capture/route.ts
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

    // Notify sales team
    await transporter.sendMail({
      from: `"${branding.devName} Demo" <${config.smtpUser}>`,
      to: config.notifyEmail,
      subject: `New Demo Lead — ${email}`,
      html: `
        <h2>New Demo Lead</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Source:</strong> ${source || "Demo Email Gate"}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
    });

    // Send demo access email to lead
    await transporter.sendMail({
      from: `"${branding.devName} Demo" <${config.smtpUser}>`,
      to: email,
      subject: `Your ${branding.devName} Demo Access`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 500px;">
          <h2 style="color: #D4AF37;">Welcome to the ${branding.devName} Demo</h2>
          <p>Thank you for your interest. You now have full access to the interactive demo.</p>
          
          <div style="background: #0A1F16; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px;">📊 CMS Export Demo</h3>
            <p style="margin: 0 0 15px;">Download a sample Consolidated Mark Sheet to see the exact Excel format our system produces:</p>
            <a href="${branding.appUrl}/demo/sample-cms.xlsx" 
               style="background: #D4AF37; color: #0A1F16; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Download Sample CMS →
            </a>
          </div>
          
          <p>Explore the demo at: <a href="${branding.appUrl}/demo" style="color: #D4AF37;">${branding.appUrl}/demo</a></p>
          
          <hr style="margin: 30px 0 20px; border: none; border-top: 1px solid #333;" />
          <p style="font-size: 12px; color: #666;">
            Questions? Reply to this email or contact us at ${branding.supportEmail}
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[lead-capture]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}