# 📧 Company Email Setup for Interview Invitations

## Overview

The interview invitation emails are sent using **Gmail SMTP** via nodemailer. You need to configure your company Gmail account to send emails.

## Step-by-Step Setup

### Option 1: Using Company Gmail Account (Recommended)

#### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2FA (if not already enabled)

#### Step 2: Generate App Password

1. Go directly to: https://myaccount.google.com/apppasswords
   - Or navigate: Google Account → Security → 2-Step Verification → App passwords
2. **Select app:** Choose "Mail"
3. **Select device:** Choose "Other (Custom name)"
4. **Enter name:** Type "HireOG Interview Emails" (or your company name)
5. Click **Generate**
6. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)
   - **IMPORTANT:** Save this somewhere safe - you won't see it again!
   - Remove spaces when using it (e.g., `abcdefghijklmnop`)

#### Step 3: Configure Environment Variables

**For Local Development (.env.local):**

```bash
# Add to your .env.local file
EMAIL_USER=your-company-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # 16-char app password (no spaces)

# Optional: Custom display name (e.g., "Your Company Name" instead of just email)
EMAIL_FROM_NAME=Your Company Name
```

**For Production (Vercel):**

```bash
# Add environment variables to Vercel
vercel env add EMAIL_USER production
# When prompted, enter: your-company-email@gmail.com

vercel env add EMAIL_PASSWORD production
# When prompted, enter: abcdefghijklmnop (16 chars, no spaces)

# Optional: Custom display name
vercel env add EMAIL_FROM_NAME production
# When prompted, enter: Your Company Name
```

#### Step 4: Set Custom Display Name (Optional)

The email service now supports a custom display name via `EMAIL_FROM_NAME`. 

**Example:**
- Without `EMAIL_FROM_NAME`: Emails show as `your-company-email@gmail.com`
- With `EMAIL_FROM_NAME=Your Company Name`: Emails show as `Your Company Name <your-company-email@gmail.com>`

This makes emails look more professional in the recipient's inbox!

### Option 2: Using Custom Domain Email (Gmail Workspace)

If you have a custom domain email (e.g., `hr@yourcompany.com`):

1. **Use Gmail Workspace SMTP** (same setup as above)
2. Or configure with your email provider's SMTP settings

#### Custom SMTP Configuration

If you want to use a different email provider (not Gmail), update `backend/services/emailService.js`:

```javascript
// For custom SMTP (e.g., Outlook, SendGrid, etc.)
this.transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

Then add to `.env.local`:
```bash
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
EMAIL_USER=hr@yourcompany.com
EMAIL_PASSWORD=your-password
```

## Current Email Configuration

The email service is located in: `backend/services/emailService.js`

**Current sender email:** Uses `process.env.EMAIL_USER` or defaults to `'noreply@hireog.com'`

**Email template:** Professional HTML template with:
- Company name in header
- Interview drive name
- Interview link button
- What to expect section
- Important notes

## Testing the Setup

### 1. Test Locally

```bash
# Start your backend server
cd backend
npm start

# In another terminal, test email sending
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User"
  }'
```

### 2. Test Interview Invite Email

After setting up, when you send interview invites from the dashboard, check:
- Email arrives in candidate's inbox
- Sender shows as your company email
- Email content is correct
- Interview link works

### 3. Check Backend Logs

Look for:
```
📧 Email service configured with: your-company-email@gmail.com
Interview invite sent successfully: <message-id>
```

## Troubleshooting

### ❌ "Invalid credentials" error

**Solution:**
- Make sure you're using the **App Password**, NOT your regular Gmail password
- Verify 2FA is enabled on your Gmail account
- Check that the password has no spaces (16 characters total)

### ❌ Emails going to spam

**Solutions:**
1. Mark first email as "Not Spam"
2. Add your company email to contacts
3. Use a custom domain email (better deliverability)
4. Consider using SendGrid or Mailgun for production

### ❌ Not receiving emails

**Check:**
1. ✅ Correct email address in `EMAIL_USER`
2. ✅ App password copied correctly (no spaces)
3. ✅ 2FA is enabled on Gmail
4. ✅ Check spam/junk folder
5. ✅ Wait 30-60 seconds (first email may be slow)
6. ✅ Check backend logs for errors

### ❌ "Less secure app access" error

**Solution:** This shouldn't happen with App Passwords. If you see this:
1. Make sure you're using App Password (not regular password)
2. Enable 2FA first, then generate App Password

## Email Limits

### Gmail SMTP:
- ✅ Free
- ❌ Limited to **500 emails/day**
- ❌ May go to spam for bulk sends
- ✅ Good for testing/small apps

### For Production (High Volume):

Consider using:
- **SendGrid**: 100 emails/day free, better deliverability
- **Mailgun**: 5,000 emails/month free (first 3 months)
- **AWS SES**: Very cheap, highly scalable

## Security Best Practices

⚠️ **NEVER commit credentials to git!**

✅ **Always use environment variables**
✅ **Use App Passwords, not regular passwords**
✅ **Rotate passwords periodically**
✅ **Use different passwords for dev/prod**

## Quick Reference

### Environment Variables Needed:

```bash
# Required
EMAIL_USER=your-company-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# Optional
EMAIL_FROM_NAME=Your Company Name  # Display name in recipient's inbox

# Optional (for custom SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### Where Emails Are Sent From:

- **Interview Invitations**: `backend/routes/company-simple.js` → `emailService.sendInterviewInvite()`
- **OTP Emails**: `backend/routes/auth.js` → `sendOTPEmail()`
- **Welcome Emails**: `backend/routes/auth.js` → `sendWelcomeEmail()`

All use the same `EMAIL_USER` configuration!

## Next Steps

1. ✅ Generate Gmail App Password
2. ✅ Add `EMAIL_USER` and `EMAIL_PASSWORD` to `.env.local`
3. ✅ Test email sending locally
4. ✅ Add same variables to Vercel production environment
5. ✅ Deploy and test in production

Your interview emails will now be sent from your company email! 🎉

