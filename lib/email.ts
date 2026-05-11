import nodemailer from "nodemailer";

// ============================================================
// SMTP Config — simplified for 6v6 Vietnam (env-only)
// ============================================================
interface SmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromName: string;
    fromEmail: string;
}

function getSmtpConfig(): SmtpConfig | null {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        return {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS || "",
            fromName: process.env.SMTP_FROM_NAME || "6v6 Vietnam",
            fromEmail: process.env.SMTP_FROM || process.env.SMTP_USER || "",
        };
    }
    return null;
}

function createTransporter(config: SmtpConfig) {
    const host = config.host.toLowerCase();
    const isOutlook = host.includes("outlook") || host.includes("office365") || host.includes("hotmail");

    const transportConfig: any = {
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: { user: config.user, pass: config.pass },
    };

    if (isOutlook) {
        transportConfig.secure = false;
        transportConfig.port = 587;
        transportConfig.tls = { ciphers: "SSLv3", rejectUnauthorized: false };
        transportConfig.requireTLS = true;
    } else if (!transportConfig.secure && transportConfig.port === 587) {
        transportConfig.tls = { rejectUnauthorized: false };
    }

    return nodemailer.createTransport(transportConfig);
}

// Generate 4-digit code
export function generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Send verification email
export async function sendVerificationEmail(
    email: string,
    name: string,
    code: string
): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
    try {
        const config = getSmtpConfig();
        if (!config) {
            console.error("[SMTP] No SMTP config. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local");
            return { success: false, error: "Không có cấu hình SMTP" };
        }

        const transporter = createTransporter(config);
        await transporter.verify();

        const fromAddress = `"${config.fromName}" <${config.fromEmail}>`;

        const mailOptions = {
            from: fromAddress,
            to: email,
            subject: `[6v6 Vietnam] Ma xac minh: ${code}`,
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background-color:#f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #7A1414 0%, #A01B1B 50%, #0F172A 100%); padding:32px 40px; text-align:center;">
                            <h1 style="color:#ffffff; font-size:24px; font-weight:700; margin:0;">6v6 Vietnam</h1>
                            <p style="color:rgba(255,255,255,0.7); font-size:13px; margin:8px 0 0; font-weight:300;">Nen tang bong da san 6 Viet Nam</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px;">
                            <p style="color:#1a1a2e; font-size:16px; margin:0 0 8px; font-weight:600;">Xin chao ${name},</p>
                            <p style="color:#6b7280; font-size:14px; line-height:1.6; margin:0 0 28px;">Cam on ban da dang ky tai khoan. Vui long nhap ma xac minh ben duoi de kich hoat tai khoan:</p>
                            <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border:2px dashed #A01B1B; border-radius:12px; padding:24px; text-align:center; margin:0 0 28px;">
                                <p style="color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:2px; margin:0 0 12px; font-weight:600;">MA XAC MINH</p>
                                <div style="font-size:40px; font-weight:800; color:#A01B1B; letter-spacing:12px; font-family:'Courier New', monospace;">${code}</div>
                            </div>
                            <div style="background:#fef3c7; border-left:4px solid #f59e0b; border-radius:0 8px 8px 0; padding:14px 16px; margin:0 0 28px;">
                                <p style="color:#92400e; font-size:13px; margin:0; font-weight:500;">Ma nay se het han sau <strong>5 phut</strong>. Vui long khong chia se ma nay voi bat ky ai.</p>
                            </div>
                            <p style="color:#9ca3af; font-size:13px; line-height:1.6; margin:0;">Neu ban khong yeu cau ma nay, vui long bo qua email nay.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#f9fafb; padding:20px 40px; border-top:1px solid #e5e7eb; text-align:center;">
                            <p style="color:#9ca3af; font-size:12px; margin:0;">&copy; 2026 6v6 Vietnam Official. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
        };

        const info = await transporter.sendMail(mailOptions);
        const previewUrl = nodemailer.getTestMessageUrl(info as any);
        console.log(`Verification email sent to ${email} (messageId: ${info.messageId})`);

        return { success: true, previewUrl: previewUrl || undefined };
    } catch (error: any) {
        console.error("Send verification email error:", error);
        return { success: false, error: error.message };
    }
}

// Send reset password email
export async function sendResetPasswordEmail(
    email: string,
    name: string,
    code: string
): Promise<{ success: boolean; previewUrl?: string }> {
    try {
        const config = getSmtpConfig();
        if (!config) return { success: false };

        const transporter = createTransporter(config);
        await transporter.verify();

        const fromAddress = `"${config.fromName}" <${config.fromEmail}>`;

        const mailOptions = {
            from: fromAddress,
            to: email,
            subject: `[6v6 Vietnam] Dat lai mat khau - Ma: ${code}`,
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background-color:#f4f6f9; font-family: sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #7A1414 0%, #A01B1B 50%, #0F172A 100%); padding:32px 40px; text-align:center;">
                            <h1 style="color:#ffffff; font-size:24px; font-weight:700; margin:0;">6v6 Vietnam</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px;">
                            <p style="color:#1a1a2e; font-size:16px; margin:0 0 8px; font-weight:600;">Xin chao ${name},</p>
                            <p style="color:#6b7280; font-size:14px; line-height:1.6; margin:0 0 28px;">Chung toi nhan duoc yeu cau dat lai mat khau. Vui long su dung ma xac nhan:</p>
                            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border:2px dashed #f59e0b; border-radius:12px; padding:24px; text-align:center; margin:0 0 28px;">
                                <p style="color:#92400e; font-size:12px; text-transform:uppercase; letter-spacing:2px; margin:0 0 12px; font-weight:600;">MA DAT LAI MAT KHAU</p>
                                <div style="font-size:40px; font-weight:800; color:#b45309; letter-spacing:12px; font-family:'Courier New', monospace;">${code}</div>
                            </div>
                            <div style="background:#fef2f2; border-left:4px solid #ef4444; border-radius:0 8px 8px 0; padding:14px 16px; margin:0 0 28px;">
                                <p style="color:#991b1b; font-size:13px; margin:0; font-weight:500;">Ma nay se het han sau <strong>15 phut</strong>.</p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#f9fafb; padding:20px 40px; border-top:1px solid #e5e7eb; text-align:center;">
                            <p style="color:#9ca3af; font-size:12px; margin:0;">&copy; 2026 6v6 Vietnam Official</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
        };

        const info = await transporter.sendMail(mailOptions);
        const previewUrl = nodemailer.getTestMessageUrl(info as any);
        return { success: true, previewUrl: previewUrl || undefined };
    } catch (error) {
        console.error("Send reset password email error:", error);
        return { success: false };
    }
}
