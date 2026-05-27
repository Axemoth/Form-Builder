import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export interface SendEmailArgs {
  to: string;
  subject: string;
  formTitle: string;
  themeName: string;
  type: "creator" | "respondent";
  answers: Array<{ label: string; value: any; type: string }>;
}

function formatEmailValue(val: any, type: string, isBatman?: boolean): string {
  if (val === undefined || val === null || val === "") return "<em>(empty)</em>";
  if (type === "checkbox") {
    return val ? "✅ Yes" : "❌ No";
  }
  if (type === "rating") {
    const num = Number(val);
    if (!isNaN(num)) {
      if (isBatman) {
        return "🦇".repeat(num) + "♢".repeat(5 - num);
      }
      return "★".repeat(num) + "☆".repeat(5 - num);
    }
  }
  if (Array.isArray(val)) {
    return val.join(", ");
  }
  return String(val);
}

function generateHtmlTemplate(args: SendEmailArgs): string {
  const isStark = args.themeName === "stark";
  const isBatman = args.themeName === "batman";
  const { formTitle, type, answers } = args;

  const titleText =
    type === "creator" ? `New Intel Signal Dispatched` : `Your Gotham Signal Receipt`;

  const subtitleText =
    type === "creator"
      ? `An operator has filed new intel logs for your survey.`
      : `Here is a complete copy of the encrypted answers logged for your records.`;

  // Render the answers list
  const rowsHtml = answers
    .map(
      (ans) => `
    <tr style="border-bottom: 1px solid ${
      isBatman
        ? "rgba(245, 185, 33, 0.15)"
        : isStark
          ? "rgba(0, 240, 255, 0.15)"
          : "rgba(201, 168, 76, 0.15)"
    };">
      <td style="padding: 12px 8px; font-weight: bold; text-align: left; vertical-align: top; width: 40%; color: ${
        isBatman ? "#F5B921" : isStark ? "#00f0ff" : "#c9a84c"
      }; font-size: 13px; font-family: inherit;">
        ${ans.label}
      </td>
      <td style="padding: 12px 8px; text-align: left; vertical-align: top; color: #ffffff; font-size: 13px; font-family: inherit;">
        ${formatEmailValue(ans.value, ans.type, isBatman)}
      </td>
    </tr>
  `,
    )
    .join("");

  if (isBatman) {
    // Gothic Dark Knight premium theme
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${args.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0C10; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #d1d5db; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0B0C10; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1F2833; border: 2px solid #F5B921; border-radius: 16px; overflow: hidden; box-shadow: 0 0 25px rgba(245, 185, 33, 0.15);">
          <!-- Header Bar -->
          <tr>
            <td style="background: linear-gradient(90deg, #F5B921, #B8860B); padding: 25px 30px; text-align: center; border-bottom: 2px solid #F5B921;">
              <h1 style="margin: 0; font-size: 16px; font-weight: bold; letter-spacing: 2px; color: #0B0C10; text-transform: uppercase;">
                🦇 GOTHAM KNIGHT INTEL HUD DISPATCH 🦇
              </h1>
            </td>
          </tr>
          
          <!-- Content Area -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #F5B921; font-weight: bold; text-transform: uppercase; border-left: 3px solid #F5B921; padding-left: 10px;">
                ${titleText}
              </h2>
              <p style="margin: 0 0 25px 0; font-size: 12px; color: rgba(209, 213, 219, 0.7); line-height: 1.6;">
                ${subtitleText}
              </p>
              
              <!-- Form metadata card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(245, 185, 33, 0.05); border: 1px solid rgba(245, 185, 33, 0.2); border-radius: 8px; margin-bottom: 25px; padding: 15px;">
                <tr>
                  <td style="font-size: 10px; color: #F5B921; font-weight: bold; text-transform: uppercase; padding-bottom: 4px;">
                    INTEL SOURCE CHANNEL (FORM TITLE)
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 14px; font-weight: bold; color: #ffffff;">
                    ${formTitle}
                  </td>
                </tr>
              </table>

              <!-- Question/Answers Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 30px; font-family: inherit;">
                <thead>
                  <tr style="border-bottom: 2px solid #F5B921; text-transform: uppercase;">
                    <th style="padding: 10px 8px; text-align: left; font-size: 11px; color: #F5B921; font-weight: bold;">Intel Core Coordinate</th>
                    <th style="padding: 10px 8px; text-align: left; font-size: 11px; color: #F5B921; font-weight: bold;">Transmitted Signal</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>

              <!-- Footer info -->
              <div style="border-top: 1px solid rgba(245, 185, 33, 0.15); padding-top: 20px; text-align: center;">
                <p style="margin: 0; font-size: 9px; color: rgba(245, 185, 33, 0.4); text-transform: uppercase; letter-spacing: 1px;">
                  SYSTEM SECURED // GOTHAM COM-LINK COMPASS
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  } else if (isStark) {
    // Futuristic Stark Avengers theme
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${args.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070b13; font-family: 'Courier New', Courier, monospace; color: #e0f2fe; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070b13; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0b1528; border: 2px solid #00f0ff; border-radius: 16px; overflow: hidden; box-shadow: 0 0 25px rgba(0, 240, 255, 0.15);">
          <!-- Header Bar -->
          <tr>
            <td style="background: linear-gradient(90deg, #00f0ff, #0072ff); padding: 25px 30px; text-align: center; border-bottom: 2px solid #00f0ff;">
              <h1 style="margin: 0; font-size: 16px; font-weight: bold; letter-spacing: 2px; color: #070b13; text-transform: uppercase;">
                🛡️ STARK SECURE DATA HUD DISPATCH 🛡️
              </h1>
            </td>
          </tr>
          
          <!-- Content Area -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #00f0ff; font-weight: bold; text-transform: uppercase; border-left: 3px solid #00f0ff; padding-left: 10px;">
                ${titleText}
              </h2>
              <p style="margin: 0 0 25px 0; font-size: 12px; color: rgba(224, 242, 254, 0.7); line-height: 1.6;">
                ${subtitleText}
              </p>
              
              <!-- Form metadata card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 8px; margin-bottom: 25px; padding: 15px;">
                <tr>
                  <td style="font-size: 10px; color: #00f0ff; font-weight: bold; text-transform: uppercase; padding-bottom: 4px;">
                    TELEMETRY CHANNEL (FORM TITLE)
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 14px; font-weight: bold; color: #ffffff;">
                    ${formTitle}
                  </td>
                </tr>
              </table>

              <!-- Question/Answers Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 30px; font-family: inherit;">
                <thead>
                  <tr style="border-bottom: 2px solid #00f0ff; text-transform: uppercase;">
                    <th style="padding: 10px 8px; text-align: left; font-size: 11px; color: #00f0ff; font-weight: bold;">Telemetry Core</th>
                    <th style="padding: 10px 8px; text-align: left; font-size: 11px; color: #00f0ff; font-weight: bold;">Transmitted Signal</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>

              <!-- Footer info -->
              <div style="border-top: 1px solid rgba(0, 240, 255, 0.15); padding-top: 20px; text-align: center;">
                <p style="margin: 0; font-size: 9px; color: rgba(0, 240, 255, 0.4); text-transform: uppercase; letter-spacing: 1px;">
                  SYSTEM SECURED // STARK COM-LINK NETWORK
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  } else {
    // Beautiful Wano Country theme
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${args.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #060b13; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #f5eedc; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #060b13; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #101c30; border: 2px solid #c9a84c; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          <!-- Header Bar -->
          <tr>
            <td style="background: linear-gradient(90deg, #c41e3a, #c9a84c); padding: 25px 30px; text-align: center; border-bottom: 2px solid #c9a84c; position: relative;">
              <h1 style="margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 3px; color: #ffffff; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6); font-family: 'Georgia', serif;">
                ⚓ GRAND LINE SURVEY DISPATCH ⚓
              </h1>
            </td>
          </tr>
          
          <!-- Content Area -->
          <tr>
            <td style="padding: 35px 40px;">
              <h2 style="margin: 0 0 10px 0; font-size: 19px; color: #c9a84c; font-weight: bold; font-family: 'Georgia', serif;">
                🌸 ${titleText} 🌸
              </h2>
              <p style="margin: 0 0 25px 0; font-size: 12.5px; color: rgba(245, 238, 220, 0.75); line-height: 1.6;">
                ${subtitleText}
              </p>
              
              <!-- Form metadata card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(201, 168, 76, 0.05); border: 1px solid rgba(201, 168, 76, 0.2); border-radius: 10px; margin-bottom: 25px; padding: 15px;">
                <tr>
                  <td style="font-size: 9px; color: #c9a84c; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; padding-bottom: 4px; font-family: 'Georgia', serif;">
                    Island Survey Location (Form)
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 15px; font-weight: bold; color: #ffffff;">
                    🌸 ${formTitle}
                  </td>
                </tr>
              </table>

              <!-- Question/Answers Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 30px; font-family: inherit;">
                <thead>
                  <tr style="border-bottom: 2px solid #c9a84c;">
                    <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #c9a84c; font-weight: bold; font-family: 'Georgia', serif; text-transform: uppercase; letter-spacing: 1px;">Log coordinate</th>
                    <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #c9a84c; font-weight: bold; font-family: 'Georgia', serif; text-transform: uppercase; letter-spacing: 1px;">Recorded Data</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>

              <!-- Footer info -->
              <div style="border-top: 1px solid rgba(201, 168, 76, 0.15); padding-top: 20px; text-align: center;">
                <p style="margin: 0; font-size: 10px; color: rgba(245, 238, 220, 0.4); text-transform: uppercase; letter-spacing: 1px; font-family: 'Georgia', serif;">
                  DISPATCHED VIA NEWS COO BIRD LOG POSE // WANO DIVISION
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}

function generateTextTemplate(args: SendEmailArgs): string {
  const { formTitle, type, answers } = args;
  const titleText =
    type === "creator" ? `New Survey Response Dispatched` : `Your Survey Response Receipt`;

  const qaText = answers
    .map((ans) => `- ${ans.label}: ${formatEmailValue(ans.value, ans.type)}`)
    .join("\n");

  return `
======================================================================
${args.subject.toUpperCase()}
======================================================================

${titleText}
Form Title: ${formTitle}

Submitted Answers:
${qaText}

----------------------------------------------------------------------
AxeForm Secure Transmission.
======================================================================
  `;
}

export async function sendNotificationEmail(args: SendEmailArgs): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || "AxeForm <noreply@axeform.com>";

  const html = generateHtmlTemplate(args);
  const text = generateTextTemplate(args);

  // Check if SMTP is configured
  if (smtpHost && smtpPort && smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: args.to,
      subject: args.subject,
      text,
      html,
    });

    console.log(`[SMTP] Email successfully sent to ${args.to}: ${args.subject}`);
    return true;
  } else {
    // -------------------------------------------------------------
    // VISUAL LOCAL SANDBOX TESTING FALLBACK
    // -------------------------------------------------------------
    const timestamp = Date.now();
    const cleanTo = args.to.replace(/[^a-zA-Z0-9]/g, "_");

    const projectRoot = path.resolve(process.cwd());
    const sandboxDir = path.join(projectRoot, "tmp", "test-emails");

    try {
      fs.mkdirSync(sandboxDir, { recursive: true });
      const filename = `${timestamp}_${args.type}_to_${cleanTo}.html`;
      const filePath = path.join(sandboxDir, filename);
      fs.writeFileSync(filePath, html, "utf-8");

      const relativePath = path.relative(projectRoot, filePath);

      console.log("\n");
      console.log("=================== 📧 SANDBOX EMAIL DISPATCHED 📧 ===================");
      console.log(`To:      ${args.to}`);
      console.log(`Subject: ${args.subject}`);
      console.log(`Type:    ${args.type.toUpperCase()}`);
      console.log(`Theme:   ${args.themeName.toUpperCase()}`);
      console.log(`File:    ${relativePath}`);
      console.log("=====================================================================");
      console.log("\n");
    } catch (fsErr) {
      console.error("[SANDBOX] Failed to write sandbox HTML file:", fsErr);
    }

    return true;
  }
}

export interface SendVerificationEmailArgs {
  to: string;
  token: string;
}

export async function sendVerificationEmail(args: SendVerificationEmailArgs): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || "AxeForm <noreply@axeform.com>";
  const clientUrl =
    process.env.CLIENT_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === "production" ? "https://axeform.axemoth.com" : "http://localhost:3000");

  const verificationUrl = `${clientUrl}/auth/verify-email?token=${args.token}`;

  const subject = "Verify your AxeForm account";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #060b13; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #f5eedc; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #060b13; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #101c30; border: 2px solid #c9a84c; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          <tr>
            <td style="background: linear-gradient(90deg, #c41e3a, #c9a84c); padding: 25px 30px; text-align: center; border-bottom: 2px solid #c9a84c;">
              <h1 style="margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 3px; color: #ffffff; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6); font-family: 'Georgia', serif;">
                ⚓ AXEFORM SURVEY CO. ⚓
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 40px; text-align: center;">
              <h2 style="margin: 0 0 15px 0; font-size: 19px; color: #c9a84c; font-family: 'Georgia', serif;">
                🌸 Welcome Aboard! 🌸
              </h2>
              <p style="margin: 0 0 25px 0; font-size: 13px; color: rgba(245, 238, 220, 0.75); line-height: 1.6;">
                Thank you for joining our crew. To verify your email coordinates and unlock full platform capabilities, please click the button below:
              </p>
              
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 30px auto;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #c41e3a;">
                    <a href="${verificationUrl}" target="_blank" style="padding: 12px 24px; border: 1px solid #c9a84c; border-radius: 8px; font-family: inherit; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; display: inline-block;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 10px 0; font-size: 11px; color: rgba(245, 238, 220, 0.5); line-height: 1.4;">
                If you did not initiate this credentials registration, you can safely disregard this message.
              </p>
              
              <p style="margin: 0; font-size: 10px; color: rgba(245, 238, 220, 0.4); text-transform: uppercase; letter-spacing: 1px; font-family: 'Georgia', serif;">
                DISPATCHED VIA NEWS COO BIRD // WANO DIVISION
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Verify your AxeForm Account:
To verify your email address and unlock all platform capabilities, visit:
${verificationUrl}

If you did not sign up for an account, please ignore this email.
  `;

  if (smtpHost && smtpPort && smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: args.to,
      subject,
      text,
      html,
    });

    console.log(`[SMTP] Verification email sent to ${args.to}`);
    return true;
  } else {
    // VISUAL LOCAL SANDBOX
    const timestamp = Date.now();
    const cleanTo = args.to.replace(/[^a-zA-Z0-9]/g, "_");
    const projectRoot = path.resolve(process.cwd());
    const sandboxDir = path.join(projectRoot, "tmp", "test-emails");

    try {
      fs.mkdirSync(sandboxDir, { recursive: true });
      const filename = `${timestamp}_verification_to_${cleanTo}.html`;
      const filePath = path.join(sandboxDir, filename);
      fs.writeFileSync(filePath, html, "utf-8");

      console.log("\n=================== 📧 SANDBOX VERIFICATION EMAIL 📧 ===================");
      console.log(`To:      ${args.to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Link:    ${verificationUrl}`);
      console.log(`File:    ${path.relative(projectRoot, filePath)}`);
      console.log("=========================================================================\n");
    } catch (fsErr) {
      console.error("[SANDBOX] Failed to write sandbox HTML file:", fsErr);
    }
    return true;
  }
}
