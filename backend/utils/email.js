import nodemailer from "nodemailer";

const transporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP is not configured. Add Gmail SMTP credentials to the backend environment.");
  }

  await transporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html
  });
};

export const verificationEmail = (name, otp) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033">
    <h2>Welcome to SecureVote, ${name}</h2>
    <p>Please enter this OTP in SecureVote to verify your email address.</p>
    <p style="font-size:32px;font-weight:800;letter-spacing:8px;color:#0f766e;margin:18px 0">${otp}</p>
    <p>This OTP expires in 10 minutes. Do not share it with anyone.</p>
  </div>
`;

export const resetEmail = (name, url) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033">
    <h2>Password reset requested</h2>
    <p>Hello ${name}, use the button below to reset your SecureVote password.</p>
    <p><a href="${url}" style="background:#1d4ed8;color:white;padding:12px 18px;border-radius:8px;text-decoration:none">Reset password</a></p>
    <p>This link expires in 15 minutes. Ignore this email if you did not request it.</p>
  </div>
`;
