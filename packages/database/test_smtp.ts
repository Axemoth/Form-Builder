import "dotenv/config";
import nodemailer from "nodemailer";

async function main() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "AxeForm <noreply@axeform.com>";

  console.log("🔍 Checking environment variables...");
  console.log("SMTP_HOST:", host);
  console.log("SMTP_PORT:", port);
  console.log("SMTP_USER:", user);
  console.log("SMTP_FROM:", from);
  console.log("SMTP_PASS set:", pass ? "YES (hidden)" : "NO");

  if (!host || !port || !user || !pass) {
    console.error("❌ Missing SMTP environment variables in your root .env file!");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  console.log("\n⚡ Verifying connection to Resend SMTP server...");
  try {
    await transporter.verify();
    console.log("✅ SUCCESS: Resend SMTP connection verified successfully!");

    console.log("\n📧 Sending a test email to check if sending works...");
    console.log(
      "(Note: Resend free tier onboarding@resend.dev can only send to the signup owner's email address)",
    );

    const info = await transporter.sendMail({
      from,
      to: "rushil.gorasia@gmail.com",
      subject: "AxeForm SMTP Verification Test",
      text: "Congratulations! Your Resend SMTP integration is 100% working and ready to dispatch survey records!",
      html: `
        <div style="background-color: #0f172a; padding: 30px; border-radius: 12px; font-family: sans-serif; color: #f8fafc; max-width: 500px; margin: 0 auto; border: 1px solid #334155;">
          <h2 style="color: #38bdf8; margin-top: 0;">🚀 Resend SMTP Verified!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Your root environment SMTP details have been successfully verified by our checker.</p>
          <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; border: 1px solid #475569; margin: 20px 0;">
            <strong style="color: #f1f5f9; display: block; margin-bottom: 6px; font-size: 12px; text-transform: uppercase;">Connection Metrics:</strong>
            <span style="display: block; font-size: 13px; color: #94a3b8;">Host: <code style="color: #f472b6;">smtp.resend.com</code></span>
            <span style="display: block; font-size: 13px; color: #94a3b8;">Port: <code style="color: #f472b6;">465 (SSL)</code></span>
            <span style="display: block; font-size: 13px; color: #94a3b8;">Sender: <code style="color: #f472b6;">onboarding@resend.dev</code></span>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">AxeForm Secure Transmission. Ready for adventure!</p>
        </div>
      `,
    });
    console.log("✅ SUCCESS: Test email successfully sent!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ ERROR: Connection failed!", error);
  }
}

main();
