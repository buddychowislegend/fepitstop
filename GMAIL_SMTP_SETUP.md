# 📧 Gmail SMTP Setup for Email Verification

## Quick Setup (5 minutes)

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2FA (if not already enabled)

### Step 2: Generate App Password

1. Go to:   
   - Or: Google Account → Security → 2-Step Verification → App passwords
2. **Select app:** Choose "Mail"
3. **Select device:** Choose "Other (Custom name)"
4. **Enter name:** Type "Frontend Pitstop"
5. Click **Generate**
6. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)
   - **IMPORTANT:** Save this somewhere safe - you won't see it again!

### Step 3: Add to Vercel

```bash
cd backend

# Add your Gmail address
vercel env add EMAIL_USER production
# When prompted, enter: your-email@gmail.com

# Add the app password (remove spaces)
vercel env add EMAIL_PASSWORD production  
# When prompted, enter: abcdefghijklmnop (16 chars, no spaces)
```

### Step 4: Deploy

```bash
vercel --prod
```

### Step 5: Test

Wait 10 seconds after deployment, then test:

```bash
# Test OTP send
curl -X POST https://fepit.vercel.app/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@gmail.com", "name": "Test User"}'

# Check your email inbox!
```

## Troubleshooting

### "Invalid credentials" error

**Solution:** Make sure you're using the App Password, NOT your regular Gmail password.

### Emails going to spam

**Solution:** 
1. Mark first email as "Not Spam"
2. Add `noreply@yourdomain.com` to contacts
3. Consider using a custom domain email or SendGrid for production

### Not receiving emails

**Check:**
1. ✅ Correct Gmail address in `EMAIL_USER`
2. ✅ App password copied without spaces
3. ✅ 2FA is enabled on Gmail
4. ✅ Check spam/junk folder
5. ✅ Wait 30-60 seconds (first email may be slow)

### View Vercel logs

```bash
vercel logs fepit.vercel.app --follow
```

Look for:
- `📧 Email service configured with: your-email@gmail.com` ✅ Good
- `⚠️ Email not configured` ❌ Variables not set

## Alternative: SendGrid (Recommended for Production)

SendGrid offers **100 free emails/day** and better deliverability:

### Setup SendGrid:

1. Sign up: https://signup.sendgrid.com/
2. Create API Key: Settings → API Keys → Create API Key
3. Copy the key (starts with `SG.`)
4. Update email service:

```javascript
// backend/services/emailService.js
const createTransporter = () => {
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }
  // ... Gmail fallback
};
```

5. Add to Vercel:
```bash
vercel env add SENDGRID_API_KEY production
vercel env add EMAIL_USER production  # sender email
```

## Email Limits

### Gmail SMTP:
- ✅ Free
- ❌ Limited to 500 emails/day
- ❌ May go to spam
- ✅ Good for testing/small apps

### SendGrid:
- ✅ 100 emails/day free
- ✅ Better deliverability
- ✅ Analytics dashboard
- ✅ Production-ready

### Mailgun:
- ✅ 5,000 emails/month free (first 3 months)
- ✅ Great deliverability
- ✅ Production-ready

## Verify Setup

After adding environment variables and deploying:

```bash
# Check environment variables are set
vercel env ls

# Should show:
# EMAIL_USER          production
# EMAIL_PASSWORD      production
# MONGODB_URI         production
```

## Test Email Sending

```bash
# Send test OTP
curl -X POST https://fepit.vercel.app/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@gmail.com",
    "name": "Your Name"
  }'

# Expected response:
{
  "message": "OTP sent successfully to your email",
  "email": "your-email@gmail.com",
  "emailSent": true
}
```

Check your email! You should receive a beautiful email with a 6-digit code.

## Email Template Preview

The OTP email includes:
- 📧 Professional design with Frontend Pitstop branding
- 🔢 Large, easy-to-read 6-digit code
- ⏱️ Expiration time (10 minutes)
- 🎨 Gradient header with purple/blue colors
- 📱 Mobile-responsive design

## Security Notes

⚠️ **NEVER commit credentials to git!**

```bash
# Already in .gitignore:
.env
.env.local
.env.production
```

✅ **Always use environment variables**
✅ **Use App Passwords, not regular passwords**
✅ **Rotate passwords periodically**

## Current Status

After setup, users will:
1. Enter email and name
2. Receive OTP via email (within 10-30 seconds)
3. Enter 6-digit code
4. Complete signup with password
5. Receive welcome email

All emails will be sent from your configured Gmail account!
