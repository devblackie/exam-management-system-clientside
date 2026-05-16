// src/app/api/pilot-request/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { branding } from "@/config/branding";
import { config } from "@/config/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { institutionName, fullName, jobTitle, email, studentCount, howHeard, message, source } = body;

    if (!institutionName || !fullName || !email || !studentCount) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    // Validate email domain - institutional emails only
    const emailDomain = email.split("@")[1];
    const freeEmailDomains = [
      // "gmail.com",
      "yahoo.com", "hotmail.com", "outlook.com", "protonmail.com",
    ];
    if (freeEmailDomains.includes(emailDomain?.toLowerCase() || "")) {
      return NextResponse.json({ message: "Please use your institutional email address." }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: { user: config.smtpUser, pass: config.smtpPass },
    });

    await transporter.sendMail({
      from: `"${branding.devName}" <${config.smtpUser}>`,
      to: config.notifyEmail,
      replyTo: email,
      subject: `New Pilot Request — ${institutionName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">New Pilot Request</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0;"><strong>Institution</strong></td><td>${institutionName}</td></tr>
            <tr><td style="padding: 8px 0;"><strong>Name</strong></td><td>${fullName}${jobTitle ? ` (${jobTitle})` : ""}</td></tr>
            <tr><td style="padding: 8px 0;"><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px 0;"><strong>Student Count</strong></td><td>${studentCount}</td></tr>
            <tr><td style="padding: 8px 0;"><strong>Source</strong></td><td>${source || "Demo Page"}</td></tr>
            ${howHeard ? `<tr><td style="padding: 8px 0;"><strong>How Heard</strong></td><td>${howHeard}</td></tr>` : ""}
            ${message ? `<tr><td style="padding: 8px 0;"><strong>Message</strong></td><td>${message}</td></tr>` : ""}
          </table>
          <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666;">
            Generated from ${branding.devName} pilot request form.
          </p>
        </div>
      `,
    });

    // Optional: Send auto-reply to the lead
    await transporter.sendMail({
      from: `"${branding.devName} Team" <${config.smtpUser}>`,
      to: email,
      subject: `Thank you for your interest in ${branding.devName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 500px;">
          <h2 style="color: #D4AF37;">Thank you, ${fullName.split(" ")[0]}.</h2>
          <p>We've received your pilot request for <strong>${institutionName}</strong>.</p>
          <p>Our team will review your request and reach out within <strong>1 business day</strong> to schedule your onboarding call.</p>
          <p>In the meantime, feel free to explore the <a href="${branding.appUrl}/demo" style="color: #D4AF37;">interactive demo</a>.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #333;" />
          <p style="font-size: 12px; color: #666;">— ${branding.devName} Team<br>${branding.devCom}</p>
        </div>
      `,
    });

    return NextResponse.json({
      ok: true,
      message: "Request submitted successfully",
    });
  } catch (err: unknown) {
    console.error("[pilot-request]", err);
    return NextResponse.json(
      { message: "Server error. Please try again." },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { Allow: "POST" } });
}
