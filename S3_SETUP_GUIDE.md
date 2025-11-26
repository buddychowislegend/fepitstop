# S3 Video Storage Setup Guide

## Overview

This guide explains how to set up AWS S3 for video storage, which reduces video file sizes by ~25% (no base64 overhead) and eliminates MongoDB's 16MB document size limit.

## Size Comparison

### Current (Base64 in MongoDB)
- **2 min video**: ~5.3 MB (base64)
- **Storage**: MongoDB document (16MB limit)
- **Risk**: Long videos may exceed limit

### With S3 (Binary Storage)
- **2 min video**: ~4 MB (binary, ~25% smaller)
- **Storage**: S3 bucket (unlimited size)
- **MongoDB**: Only stores URL (~100 bytes)

## Implementation Status

✅ **Completed:**
- Video quality constraints (640x480, 15fps, 500kbps)
- S3 upload API endpoint (`/api/upload-video`)
- Interview page S3 integration
- Automatic fallback to base64 if S3 not configured

⏳ **Pending:**
- AWS S3 credentials setup
- Backend already handles S3 URLs (no changes needed)

## Setup Instructions

### 1. Create AWS S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click "Create bucket"
3. Configure:
   - **Bucket name**: `  (or your choice)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
   - **Block Public Access**: Uncheck "Block all public access" (or configure bucket policy)
   - **Versioning**: Optional
4. Click "Create bucket"

### 2. Configure Bucket Policy (Public Read Access)

**IMPORTANT**: Newer S3 buckets have ACLs disabled by default. You MUST configure a bucket policy for public access.

1. Go to your bucket → **Permissions** tab
2. Scroll to **"Bucket policy"** section
3. Click **"Edit"** and add this policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):

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

### 3. Create IAM User for API Access

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click "Users" → "Create user"
3. Name: `hireog-s3-uploader`
4. Select "Programmatic access"
5. Attach policy: `AmazonS3FullAccess` (or create custom policy with PutObject, GetObject permissions)
6. Save **Access Key ID** and **Secret Access Key**

### 4. Configure Environment Variables

Add to `.env.local`:

```bash
# S3 Configuration
S3_ENABLED=true
S3_BUCKET_NAME=hireog-interview-videos
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Optional: CloudFront CDN (for faster delivery)
CLOUDFRONT_URL=https://d1234567890.cloudfront.net
```

### 5. Install AWS SDK (if not already installed)

```bash
npm install @aws-sdk/client-s3
```

### 6. Test the Setup

1. Start an interview
2. Answer a question with video
3. Check browser console for:
   - `Uploaded video X to S3: https://...` (S3 working)
   - `Converted video X to base64...` (S3 not configured, using fallback)

## Optional: CloudFront CDN Setup

For faster video delivery globally:

1. Go to [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Create distribution
3. Origin: Your S3 bucket
4. Default cache behavior: Allow GET, HEAD, OPTIONS
5. Copy the CloudFront URL to `CLOUDFRONT_URL` in `.env.local`

## Cost Estimation

### S3 Storage Costs
- **Storage**: $0.023 per GB/month
- **PUT requests**: $0.005 per 1,000 requests
- **GET requests**: $0.0004 per 1,000 requests

### Example (1,000 interviews/month, avg 2 min videos)
- **Storage**: ~4 GB = $0.09/month
- **PUT requests**: 1,000 = $0.005/month
- **GET requests**: 5,000 views = $0.002/month
- **Total**: ~$0.10/month

## Backend Changes

No backend changes needed! The backend already accepts `videoUrl` in `qaPairs` and stores it in MongoDB. The interview page now sends S3 URLs instead of base64 data.

## Verification

After setup, verify:

1. **Check MongoDB**: Documents should have `videoUrl` (S3 URL) instead of `videoData` (base64)
2. **Check S3**: Videos should appear in bucket at `interviews/{interviewId}/question-{index}-{timestamp}.webm`
3. **Check playback**: Videos should play from S3 URLs in the results page

## Troubleshooting

### Videos still using base64
- Check `S3_ENABLED=true` in `.env.local`
- Verify AWS credentials are correct
- Check browser console for S3 upload errors

### 403 Forbidden on S3 URLs
- Verify bucket policy allows public read access
- Check IAM user has correct permissions

### Videos not uploading
- Check AWS SDK is installed: `npm list @aws-sdk/client-s3`
- Verify bucket name and region match `.env.local`
- Check network tab for upload errors

## Rollback

If you need to disable S3:
1. Set `S3_ENABLED=false` in `.env.local`
2. System will automatically fall back to base64 encoding
3. Existing S3 videos will continue to work (URLs are stored in DB)

