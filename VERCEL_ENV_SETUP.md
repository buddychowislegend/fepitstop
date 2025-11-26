# Vercel Environment Variables Setup

## Required Environment Variables

Make sure you have these **exact** variable names in your Vercel project:

1. `S3_ENABLED` = `true` (must be the string "true", not boolean)
2. `S3_BUCKET_NAME` = your bucket name (e.g., `hireog-interview-videos`)
3. `S3_REGION` = your AWS region (e.g., `us-east-1`)
4. `AWS_ACCESS_KEY_ID` = your AWS access key ID
5. `AWS_SECRET_ACCESS_KEY` = your AWS secret access key

## How to Add/Verify in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: The variable name (exactly as shown above)
   - **Value**: The actual value
   - **Environment**: Select all (Production, Preview, Development)

## Important Notes

### Variable Names Must Match Exactly
- ✅ `S3_ENABLED` (correct)
- ❌ `S3_ENABLED_FLAG` (wrong)
- ❌ `s3_enabled` (wrong - case sensitive)

### S3_ENABLED Value
- ✅ `true` (string, lowercase)
- ❌ `True` (wrong case)
- ❌ `1` (wrong type)
- ❌ `yes` (wrong value)

### After Adding Variables

1. **Redeploy your application** - Environment variables are only available after redeployment
2. Go to **Deployments** tab
3. Click **"Redeploy"** on the latest deployment
4. Or push a new commit to trigger a new deployment

## Debugging

The updated code now logs which variables are missing. Check your Vercel function logs:

1. Go to **Deployments** → Click on latest deployment
2. Click **"Functions"** tab
3. Click on `/api/upload-video`
4. Check the logs for:
   ```
   S3 Configuration check: { enabled: true, hasBucket: true, ... }
   ```
   or
   ```
   S3 not fully configured. Missing: S3_ENABLED, AWS_ACCESS_KEY_ID
   ```

## Common Issues

### Issue: Variables not loading
**Solution**: 
- Make sure you redeployed after adding variables
- Check that variable names match exactly (case-sensitive)
- Verify variables are set for the correct environment (Production/Preview/Development)

### Issue: S3_ENABLED is false
**Solution**: 
- Make sure the value is exactly the string `"true"` (lowercase)
- Not `"True"`, `"TRUE"`, or `true` (without quotes in Vercel UI)

### Issue: Still getting base64 fallback
**Solution**:
- Check Vercel function logs to see which variable is missing
- Verify all 5 variables are set
- Make sure AWS credentials are valid

## Testing

After setting up, test by:
1. Starting an interview
2. Recording a video answer
3. Check browser console or Vercel logs for:
   - ✅ `Video X uploaded to S3: https://...` (success)
   - ❌ `S3 not fully configured. Missing: ...` (check missing variables)

