# How to Create AWS Access Keys

## Step 1: Sign in to AWS Console

1. Go to: `https://037336517082.signin.aws.amazon.com/console`
2. Enter:
   - **User name**: `hireog-s3-uploader`
   - **Password**: `vyTyS7J^`
3. Click "Sign in"

## Step 2: Navigate to IAM

1. Once logged in, search for "IAM" in the top search bar
2. Click on "IAM" service
3. In the left sidebar, click on "Users"

## Step 3: Find Your User

1. Find the user `hireog-s3-uploader` in the list
2. Click on the username to open the user details

## Step 4: Create Access Key

1. Click on the **"Security credentials"** tab
2. Scroll down to the **"Access keys"** section
3. Click **"Create access key"** button
4. Select **"Application running outside AWS"** (or "Command Line Interface (CLI)")
5. Click **"Next"**
6. (Optional) Add a description like "For S3 video uploads"
7. Click **"Create access key"**

## Step 5: Save Your Credentials

**⚠️ IMPORTANT: Save these immediately - you won't be able to see the secret key again!**

You'll see:
- **Access key ID**: Something like `AKIAIOSFODNN7EXAMPLE`
- **Secret access key**: Something like `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

**Copy both values immediately!**

## Step 6: Add to Your Project

Add these to your `.env.local` file:

```bash
S3_ENABLED=true
S3_BUCKET_NAME=your-bucket-name
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE  # Replace with your actual Access Key ID
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY  # Replace with your actual Secret Key
```

## Alternative: If You Can't Find the User

If the user `hireog-s3-uploader` doesn't exist or you can't find it:

1. In IAM, click **"Users"** → **"Create user"**
2. User name: `hireog-s3-uploader`
3. Select **"Provide user access to the AWS Management Console"** (optional, for console access)
4. Select **"Attach policies directly"**
5. Search and select **"AmazonS3FullAccess"**
6. Click **"Next"** → **"Create user"**
7. Then follow Step 4 above to create access keys

## Security Note

- Never commit these keys to git
- Keep them in `.env.local` (which should be in `.gitignore`)
- If keys are exposed, delete them immediately and create new ones

