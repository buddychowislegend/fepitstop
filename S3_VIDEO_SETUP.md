# S3 Video Storage Setup Guide

This guide will help you set up AWS S3 for storing interview videos and displaying them in the drive results.

## Step 1: Create S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click **"Create bucket"**
3. Configure your bucket:
   - **Bucket name**: Choose a unique name (e.g., `hireog-interview-videos`)
   - **AWS Region**: Choose closest region (e.g., `us-east-1`)
   - **Block Public Access**: Uncheck "Block all public access" (we need public read access for videos)
   - **Bucket Versioning**: Disable (optional)
   - **Default encryption**: Enable (recommended)
4. Click **"Create bucket"**

## Step 2: Configure Bucket Permissions

1. Go to your bucket → **Permissions** tab
2. Under **"Bucket policy"**, click **"Edit"**
3. Add this policy (replace `YOUR-BUCKET-NAME` with your bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

4. Click **"Save changes"**

## Step 3: Create IAM User for S3 Access

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **"Users"** → **"Create user"**
3. **User name**: `s3-video-uploader`
4. Select **"Provide user access to the AWS Management Console"** → **"I want to create an IAM user"**
5. Click **"Next"**
6. Under **"Set permissions"**, select **"Attach policies directly"**
7. Search and select **"AmazonS3FullAccess"** (or create a custom policy with only PutObject and GetObject permissions)
8. Click **"Next"** → **"Create user"**
9. **Important**: Click **"Create access key"**
   - Select **"Application running outside AWS"**
   - Click **"Next"** → **"Create access key"**
   - **Save the Access Key ID and Secret Access Key** (you won't see the secret again!)

## Step 4: Install AWS SDK

Run this command in your project root:

```bash
npm install @aws-sdk/client-s3
```

## Step 5: Configure Environment Variables

Add these to your `.env.local` file (in the project root):

```env
# S3 Configuration
S3_ENABLED=true
S3_BUCKET_NAME=your-bucket-name
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Optional: CloudFront URL (if using CloudFront CDN)
# CLOUDFRONT_URL=https://d1234567890.cloudfront.net
```

**For Vercel/Production:**
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add all the above variables
3. Redeploy your application

## Step 6: Verify Setup

1. Restart your development server
2. Run an interview and complete it
3. Check your S3 bucket - you should see videos in `interviews/{interviewId}/question-{index}-{timestamp}.webm`
4. Check the drive results page - videos should display automatically

## Troubleshooting

### Videos not uploading
- Check that `S3_ENABLED=true` in your environment variables
- Verify AWS credentials are correct
- Check browser console for errors
- Verify bucket permissions allow public read access

### Videos not displaying
- Check that videos are publicly accessible (test the S3 URL directly)
- Verify the video URL is stored correctly in the database
- Check browser console for CORS errors

### CORS Errors
If you see CORS errors, add this CORS configuration to your S3 bucket:
1. Go to bucket → **Permissions** → **Cross-origin resource sharing (CORS)**
2. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## Cost Optimization

- **S3 Standard-IA**: Use for videos that are viewed occasionally (saves ~45% on storage)
- **Lifecycle Policies**: Automatically move old videos to cheaper storage classes
- **Delete old videos**: Set up automatic deletion after a retention period

## Security Best Practices

1. **Use IAM roles** instead of access keys when possible (for EC2/ECS deployments)
2. **Rotate access keys** regularly
3. **Use bucket policies** to restrict access by IP if needed
4. **Enable S3 access logging** for audit trails
5. **Use CloudFront** for better performance and additional security


