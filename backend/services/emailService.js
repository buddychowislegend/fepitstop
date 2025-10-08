const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // Check if email credentials are configured
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log('📧 Email service configured with:', process.env.EMAIL_USER);
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // App-specific password for Gmail
      }
    });
  }
  
  console.log('⚠️ Email not configured - OTP will only be logged to console');
  console.log('To enable emails, set EMAIL_USER and EMAIL_PASSWORD environment variables');
  
  // For testing: No transporter means development mode
  return null;
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, name = 'User') => {
  try {
    const transporter = createTransporter();
    
    // If no transporter, log OTP for development
    if (!transporter) {
      console.log(`\n📧 OTP Email (Development Mode):`);
      console.log(`   To: ${email}`);
      console.log(`   OTP: ${otp}`);
      console.log(`   This OTP would be sent via email in production\n`);
      return { success: true, development: true };
    }

    const mailOptions = {
      from: `"Frontend Pitstop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code - Frontend Pitstop',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Frontend Pitstop!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your Verification Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
              </div>
              
              <p>If you didn't request this code, please ignore this email.</p>
              
              <p style="margin-top: 30px;">
                <strong>Why verify?</strong><br>
                Email verification helps us ensure account security and allows us to send you important updates about your learning progress.
              </p>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} Frontend Pitstop. All rights reserved.</p>
                <p>Master frontend interviews with 100+ curated problems</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    
    // In development, still log the OTP
    console.log(`\n📧 OTP for ${email}: ${otp} (Email failed: ${error.message})\n`);
    return { success: true, development: true, error: error.message };
  }
};

// Send welcome email after successful signup
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return { success: true, development: true };

    const mailOptions = {
      from: `"Frontend Pitstop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Frontend Pitstop! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Frontend Pitstop!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Your account has been successfully created! You're now ready to start your frontend interview preparation journey.</p>
              
              <h3>🚀 What's Next?</h3>
              <ul>
                <li><strong>100+ Problems</strong> - Solve curated frontend challenges</li>
                <li><strong>Quiz Mode</strong> - Test your knowledge with quick quizzes</li>
                <li><strong>Mock Interviews</strong> - Practice with AI-powered interviews</li>
                <li><strong>Track Progress</strong> - Monitor your improvement over time</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://frontendpitstop.vercel.app/problems" class="button">Start Solving Problems</a>
              </div>
              
              <p>Happy coding! 💻</p>
              <p>The Frontend Pitstop Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Welcome email error:', error);
    return { success: false, error: error.message };
  }
};

// Generate password reset token
const generateResetToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Send password reset email
const sendPasswordResetEmail = async (email, token, name = 'User') => {
  try {
    const transporter = createTransporter();
    
    // If no transporter, log token for development
    if (!transporter) {
      console.log(`\n📧 Password Reset Email (Development Mode):`);
      console.log(`   To: ${email}`);
      console.log(`   Reset Token: ${token}`);
      console.log(`   Reset Link: https://frontendpitstop.vercel.app/reset-password?token=${token}&email=${email}`);
      console.log(`   This email would be sent in production\n`);
      return { success: true, development: true };
    }

    const resetLink = `https://frontendpitstop.vercel.app/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: `"Frontend Pitstop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - Frontend Pitstop',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>We received a request to reset your password for your Frontend Pitstop account.</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Your Password</a>
              </div>
              
              <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
              <p style="font-size: 12px; word-break: break-all; background: #fff; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
                ${resetLink}
              </p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This link will expire in 30 minutes</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your password will remain unchanged</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px;">
                <strong>Need help?</strong><br>
                If you're having trouble, contact our support team at support@frontendpitstop.com
              </p>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} Frontend Pitstop. All rights reserved.</p>
                <p>Master frontend interviews with 100+ curated problems</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Password reset email error:', error);
    
    // In development, still log the token
    console.log(`\n📧 Password Reset for ${email}: ${token} (Email failed: ${error.message})\n`);
    return { success: true, development: true, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
  generateResetToken,
  sendPasswordResetEmail
};
