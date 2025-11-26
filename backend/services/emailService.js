const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
      }
    });
  }

  async sendInterviewInvite(candidateEmail, candidateName, interviewLink, companyName, driveName, position = null) {
    try {
      // Format position title nicely
      const positionTitle = position || driveName || 'the position';
      
      const mailOptions = {
        from: process.env.EMAIL_FROM_NAME 
          ? `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER || 'noreply@hireog.com'}>`
          : (process.env.EMAIL_USER || 'noreply@hireog.com'),
        to: candidateEmail,
        subject: `Interview Invitation from ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Interview Invitation</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${companyName}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Hello ${candidateName} 👋</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                You've been invited to complete a screening interview for <strong>${companyName}</strong>.
              </p>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                <strong>Position:</strong> ${positionTitle}
              </p>
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1976d2; margin-top: 0;">What to Expect:</h3>
              <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>AI-guided interview with voice & video prompts</li>
                <li>Questions tailored to your profile</li>
                <li>Finish at your convenience — takes only ~15–25 minutes</li>
                <li>To understand the interview format, you can take a quick <a href="https://hireog.com/ai-interview" style="color: #1976d2; text-decoration: underline;"><strong>demo interview</strong></a> before starting your actual attempt</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${interviewLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                Start Your Interview
              </a>
            </div>
            
            <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <h4 style="color: #f57c00; margin-top: 0; margin-bottom: 15px;">Important:</h4>
              <ol style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Complete the interview within the allocated time limit — The timer will begin once you start.</li>
                <li>Use a laptop/desktop only for the interview (mobile is not supported).</li>
                <li>Any kind of cheating will be flagged and may lead to application rejection.</li>
                <li>Switching tabs/windows or navigating away during the interview may be flagged.</li>
                <li>Your interview will be recorded for evaluation.</li>
                <li>For help, contact on <a href="mailto:hello@hireog.com" style="color: #f57c00; text-decoration: underline;">hello@hireog.com</a> or WhatsApp on <a href="https://wa.me/918147274882" style="color: #f57c00; text-decoration: underline;">8147274882</a>.</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 14px;">
                This interview link is unique to you. Please do not share it with others.
              </p>
              <p style="color: #999; font-size: 14px;">
                Powered by <strong>HireOG</strong> - AI-Powered Interview Platform
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Interview invite sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending interview invite:', error);
      return { success: false, error: error.message };
    }
  }

  async sendBulkInterviewInvites(candidates, interviewLinks, companyName, driveName, position = null) {
    const results = [];
    
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const interviewLink = interviewLinks[i];
      
      try {
        const result = await this.sendInterviewInvite(
          candidate.email,
          candidate.name,
          interviewLink,
          companyName,
          driveName,
          position
        );
        results.push({
          candidate: candidate,
          success: result.success,
          error: result.error
        });
      } catch (error) {
        results.push({
          candidate: candidate,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  async sendInterviewReminder(candidateEmail, candidateName, interviewLink, companyName) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM_NAME 
          ? `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER || 'noreply@hireog.com'}>`
          : (process.env.EMAIL_USER || 'noreply@hireog.com'),
        to: candidateEmail,
        subject: `Reminder: Complete Your Interview for ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Interview Reminder</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
              <h2 style="color: #333; margin-top: 0;">Hello ${candidateName}!</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                This is a friendly reminder that you have a pending interview for <strong>${companyName}</strong>.
              </p>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Please complete your interview at your earliest convenience.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${interviewLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                Complete Your Interview
              </a>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending interview reminder:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create instance
const emailService = new EmailService();

// Export individual functions for backward compatibility
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp, name = 'User') => {
  try {
      const mailOptions = {
        from: process.env.EMAIL_FROM_NAME 
          ? `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER || 'noreply@hireog.com'}>`
          : (process.env.EMAIL_USER || 'noreply@hireog.com'),
        to: email,
        subject: 'Your OTP for HireOG',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">HireOG</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your OTP Code</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Your OTP code for HireOG is:
            </p>
            <div style="background: #667eea; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #666; font-size: 14px;">
              This code will expire in 10 minutes. Please do not share this code with anyone.
            </p>
          </div>
        </div>
      `
    };

    const result = await emailService.transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

const sendWelcomeEmail = async (email, name) => {
  try {
      const mailOptions = {
        from: process.env.EMAIL_FROM_NAME 
          ? `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER || 'noreply@hireog.com'}>`
          : (process.env.EMAIL_USER || 'noreply@hireog.com'),
        to: email,
        subject: 'Welcome to HireOG!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to HireOG!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Welcome to HireOG! Your account has been successfully created. You can now start practicing with our AI-powered mock interviews and coding challenges.
            </p>
          </div>
        </div>
      `
    };

    const result = await emailService.transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

const generateResetToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL || 'http://hireog.com'}/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM_NAME 
        ? `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER || 'noreply@hireog.com'}>`
        : (process.env.EMAIL_USER || 'noreply@hireog.com'),
      to: email,
      subject: 'Password Reset - HireOG',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              You requested a password reset for your HireOG account. Click the button below to reset your password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    const result = await emailService.transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  ...emailService,
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
  generateResetToken,
  sendPasswordResetEmail,
  sendInterviewInvite: emailService.sendInterviewInvite.bind(emailService)
};