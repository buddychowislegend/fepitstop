import { NextRequest, NextResponse } from 'next/server';

/**
 * Upload video to S3
 * 
 * This endpoint uploads video files to AWS S3 and returns the public URL.
 * If S3 is not configured, it falls back to base64 encoding.
 * 
 * NOTE: Video submission is currently disabled. This endpoint is kept for future use.
 */

// S3 Configuration - read at runtime for Vercel compatibility
function getS3Config() {
  return {
    enabled: process.env.S3_ENABLED === 'true',
    bucket: process.env.S3_BUCKET_NAME || '',
    region: process.env.S3_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  };
}

interface UploadResponse {
  success: boolean;
  videoUrl?: string;
  videoData?: string; // Base64 fallback
  error?: string;
  method?: 's3' | 'base64';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const interviewId = formData.get('interviewId') as string || 'unknown';
    const questionIndex = formData.get('questionIndex') as string || '0';

    if (!videoFile) {
      return NextResponse.json(
        { success: false, error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Get S3 config at runtime
    const s3Config = getS3Config();
    
    // Debug logging (remove in production if needed)
    console.log('S3 Configuration check:', {
      enabled: s3Config.enabled,
      hasBucket: !!s3Config.bucket,
      hasAccessKey: !!s3Config.accessKeyId,
      hasSecretKey: !!s3Config.secretAccessKey,
      bucket: s3Config.bucket ? `${s3Config.bucket.substring(0, 3)}...` : 'missing',
      region: s3Config.region
    });

    // Check if S3 is configured and AWS SDK is available
    if (s3Config.enabled && s3Config.bucket && s3Config.accessKeyId && s3Config.secretAccessKey) {
      try {
        // Try to upload to S3 (only if AWS SDK is installed)
        const s3Url = await uploadToS3(videoFile, interviewId, questionIndex, s3Config);
        return NextResponse.json({
          success: true,
          videoUrl: s3Url,
          method: 's3'
        } as UploadResponse);
      } catch (s3Error: any) {
        // If AWS SDK is not installed, this will throw
        if (s3Error.message?.includes('Cannot find module') || s3Error.message?.includes('@aws-sdk')) {
          console.warn('AWS SDK not installed, falling back to base64');
        } else {
          console.error('S3 upload failed, falling back to base64:', s3Error);
        }
        // Fall through to base64 encoding
      }
    } else {
      // Log which variables are missing
      const missing = [];
      if (!s3Config.enabled) missing.push('S3_ENABLED');
      if (!s3Config.bucket) missing.push('S3_BUCKET_NAME');
      if (!s3Config.accessKeyId) missing.push('AWS_ACCESS_KEY_ID');
      if (!s3Config.secretAccessKey) missing.push('AWS_SECRET_ACCESS_KEY');
      console.warn('S3 not fully configured. Missing:', missing.join(', '));
    }

    // Fallback: Convert to base64 (Node.js compatible)
    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = `data:${videoFile.type || 'video/webm'};base64,${buffer.toString('base64')}`;
    
    return NextResponse.json({
      success: true,
      videoData: base64String,
      method: 'base64',
      warning: 'S3 not configured, using base64 encoding. Videos will be stored in MongoDB.'
    } as UploadResponse);

  } catch (error: any) {
    console.error('Error uploading video:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload video' },
      { status: 500 }
    );
  }
}

/**
 * Upload video to AWS S3
 * This function will fail gracefully if @aws-sdk/client-s3 is not installed
 */
async function uploadToS3(
  videoFile: File,
  interviewId: string,
  questionIndex: string,
  s3Config: ReturnType<typeof getS3Config>
): Promise<string> {
  // Dynamic import to avoid bundling AWS SDK in client
  // This will throw if the package is not installed, which is caught by the caller
  // Using string-based import to avoid TypeScript checking at compile time
  let S3Client: any, PutObjectCommand: any;
  try {
    // @ts-ignore - AWS SDK may not be installed
    const s3Module = await import('@aws-sdk/client-s3');
    S3Client = s3Module.S3Client;
    PutObjectCommand = s3Module.PutObjectCommand;
  } catch (importError: any) {
    throw new Error(`AWS SDK not installed: ${importError.message}`);
  }
  
  const s3Client = new S3Client({
    region: s3Config.region,
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
    },
  });

  // Generate unique file name
  const timestamp = Date.now();
  const fileName = `interviews/${interviewId}/question-${questionIndex}-${timestamp}.webm`;
  
  // Convert File to Buffer
  const arrayBuffer = await videoFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: s3Config.bucket,
    Key: fileName,
    Body: buffer,
    ContentType: videoFile.type || 'video/webm',
    ACL: 'public-read', // Make video publicly accessible
  });

  await s3Client.send(command);

  // Return public URL
  const publicUrl = `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${fileName}`;
  
  // If CloudFront is configured, use that instead
  const cloudfrontUrl = process.env.CLOUDFRONT_URL;
  if (cloudfrontUrl) {
    return `${cloudfrontUrl}/${fileName}`;
  }

  return publicUrl;
}

/**
 * Convert Blob to base64 string (Node.js compatible)
 * Note: This function is no longer used, but kept for reference.
 * We now convert directly from ArrayBuffer to base64 using Buffer.
 */
function blobToBase64(blob: Blob): Promise<string> {
  // This function is deprecated - use Buffer.from(arrayBuffer).toString('base64') instead
  return blob.arrayBuffer().then(buffer => {
    const nodeBuffer = Buffer.from(buffer);
    return `data:${blob.type || 'video/webm'};base64,${nodeBuffer.toString('base64')}`;
  });
}

