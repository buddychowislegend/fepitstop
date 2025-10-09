const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/emailService');

// Contact form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // Prepare email content
    const emailSubject = `Contact Form: ${subject}`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
          .value { background: white; padding: 10px; border-radius: 4px; border-left: 3px solid #667eea; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">📧 New Contact Form Submission</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Frontend Pitstop</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">From:</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${subject}</div>
            </div>
            
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
            
            <div class="footer">
              <p>This message was sent via the Frontend Pitstop contact form</p>
              <p>Reply directly to ${email} to respond to the user</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send email
    const emailService = require('../services/emailService');
    const transporter = emailService.createTransporter();
    
    if (!transporter) {
      console.log('Email service not configured. Contact form data:', { name, email, subject, message });
      return res.json({ 
        success: true, 
        message: 'Message received! We will get back to you soon.' 
      });
    }
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@frontendpitstop.com',
      to: 'fepitstop@gmail.com',
      replyTo: email,
      subject: emailSubject,
      html: emailHtml
    });
    
    console.log('Contact form email sent successfully');
    
    res.json({ 
      success: true, 
      message: 'Message sent successfully! We will get back to you within 24 hours.' 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again or email us directly at fepitstop@gmail.com' });
  }
});

module.exports = router;

