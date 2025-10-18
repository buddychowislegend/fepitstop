const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
  }

  async sendInterviewInvite(candidateEmail, candidateName, interviewLink, companyName, driveName) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@hireog.com',
        to: candidateEmail,
        subject: `Interview Invitation from ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Interview Invitation</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${companyName}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Hello ${candidateName}!</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                You have been invited to participate in a screening interview for <strong>${companyName}</strong>.
              </p>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                <strong>Interview Drive:</strong> ${driveName}
              </p>
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1976d2; margin-top: 0;">What to Expect:</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>AI-powered interview with voice interaction</li>
                <li>Questions tailored to your profile</li>
                <li>Real-time feedback and evaluation</li>
                <li>Flexible timing - complete at your convenience</li>
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
              <h4 style="color: #f57c00; margin-top: 0;">Important Notes:</h4>
              <ul style="color: #666; line-height: 1.6; margin: 0;">
                <li>Please ensure you have a stable internet connection</li>
                <li>Use a quiet environment for the best experience</li>
                <li>The interview will be recorded for evaluation purposes</li>
                <li>Contact support if you encounter any technical issues</li>
              </ul>
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

  async sendBulkInterviewInvites(candidates, interviewLinks, companyName, driveName) {
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
          driveName
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
        from: process.env.EMAIL_USER || 'noreply@hireog.com',
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

module.exports = new EmailService();