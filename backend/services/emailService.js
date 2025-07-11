const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "aneesliaqat557@gmail.com",
    pass: process.env.EMAIL_PASS || "xobg yrab vxuh kmiy",
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || "aneesliaqat557@gmail.com",
    to: email,
    subject: "Spotify Clone - Password Reset OTP",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f8f9fa;">
        <div style="background-color: #000; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #1db954; margin: 0; font-size: 28px;">Spotify Clone</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            You requested to reset your password for your Spotify Clone account. Use the OTP below to reset your password:
          </p>
          <div style="background: linear-gradient(135deg, #1db954, #1ed760); padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
            <h1 style="color: white; font-size: 36px; margin: 0; letter-spacing: 4px; font-weight: bold;">${otp}</h1>
          </div>
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>⚠️ Important:</strong> This OTP will expire in 10 minutes for security reasons.
            </p>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            If you didn't request this password reset, please ignore this email and your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            This email was sent from Spotify Clone. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendOTPEmail };