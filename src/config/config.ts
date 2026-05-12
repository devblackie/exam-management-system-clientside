export const config = {
    ga4Id: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT || "587"),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    notifyEmail: process.env.NOTIFY_EMAIL,
  };