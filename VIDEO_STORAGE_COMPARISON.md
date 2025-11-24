# Video Storage Size Comparison

## Current Implementation (Base64 in MongoDB)

### Size Calculation
- **Binary video size**: Variable based on duration and quality
- **Base64 overhead**: +33% (base64 encoding)
- **Storage location**: MongoDB document (16MB limit)

### Estimated Sizes (Per Answer)

| Duration | Binary | Base64 (Current) | MongoDB Limit Risk |
|----------|--------|------------------|-------------------|
| 15 sec | ~1.5 MB | ~2 MB | ✅ Safe |
| 30 sec | ~3 MB | ~4 MB | ✅ Safe |
| 1 min | ~6 MB | ~8 MB | ✅ Safe |
| 2 min | ~12 MB | ~16 MB | ⚠️ At limit |
| 3 min | ~18 MB | ~24 MB | ❌ Exceeds limit |

## With Size Reduction (Optimized Settings)

### Optimizations Applied
- **Resolution**: 640x480 (down from 1280x720)
- **Frame Rate**: 15 fps (down from 30 fps)
- **Bitrate**: 500 kbps (down from ~1-3 Mbps)
- **Codec**: VP9 (better compression than VP8)

### Estimated Sizes (Per Answer - Optimized)

| Duration | Binary | Base64 | Reduction | MongoDB Limit Risk |
|----------|--------|--------|-----------|-------------------|
| 15 sec | ~0.5 MB | ~0.67 MB | **67% smaller** | ✅ Safe |
| 30 sec | ~1 MB | ~1.3 MB | **67% smaller** | ✅ Safe |
| 1 min | ~2 MB | ~2.7 MB | **67% smaller** | ✅ Safe |
| 2 min | ~4 MB | ~5.3 MB | **67% smaller** | ✅ Safe |
| 3 min | ~6 MB | ~8 MB | **67% smaller** | ✅ Safe |
| 5 min | ~10 MB | ~13.3 MB | **67% smaller** | ✅ Safe |

## S3 Storage Option

### Size Comparison

| Duration | Binary | Base64 (MongoDB) | S3 (Binary) | Savings |
|----------|--------|------------------|-------------|---------|
| 15 sec | ~0.5 MB | ~0.67 MB | ~0.5 MB | **25% smaller** |
| 30 sec | ~1 MB | ~1.3 MB | ~1 MB | **23% smaller** |
| 1 min | ~2 MB | ~2.7 MB | ~2 MB | **26% smaller** |
| 2 min | ~4 MB | ~5.3 MB | ~4 MB | **25% smaller** |
| 3 min | ~6 MB | ~8 MB | ~6 MB | **25% smaller** |

### S3 Benefits

1. **No Base64 Overhead**: Store binary files directly = **~25% smaller**
2. **No Size Limits**: S3 can handle files of any size (no 16MB limit)
3. **Better Performance**: 
   - Faster uploads (no base64 encoding)
   - CDN delivery via CloudFront
   - Streaming support
4. **Cost Effective**: 
   - S3 storage: ~$0.023/GB/month
   - S3 requests: ~$0.0004 per 1000 requests
   - Much cheaper than MongoDB storage for large files
5. **Scalability**: Handle unlimited video sizes
6. **MongoDB Document**: Only stores S3 URL (~100 bytes) instead of full video

### S3 Storage Structure

```
MongoDB Document:
{
  "qaPairs": [
    {
      "question": "...",
      "answer": "...",
      "videoUrl": "https://s3.amazonaws.com/bucket/interviews/123/video1.webm",
      "hasVideo": true
    }
  ]
}
```

**MongoDB Document Size**: ~10-50 KB (instead of 5-16 MB)

### Cost Comparison (1000 interviews/month, avg 2 min videos)

| Storage Method | Storage Size | Monthly Cost |
|---------------|--------------|--------------|
| MongoDB (Base64) | ~5.3 GB | Included in MongoDB plan |
| S3 (Binary) | ~4 GB | ~$0.09/month |

## Recommendation

### Option 1: Size Reduction Only (Quick Fix)
- ✅ Already implemented
- ✅ No infrastructure changes needed
- ✅ Reduces size by ~67%
- ⚠️ Still has MongoDB 16MB limit (but much safer now)

### Option 2: S3 Storage (Best Long-term)
- ✅ No size limits
- ✅ ~25% additional size reduction
- ✅ Better performance and scalability
- ✅ More cost-effective for large scale
- ⚠️ Requires AWS setup and API changes

### Option 3: Hybrid Approach
- Use optimized settings (already done)
- Store videos < 5MB in MongoDB (base64)
- Store videos > 5MB in S3
- Best of both worlds

## Implementation Status

- ✅ **Video quality constraints**: Implemented
- ✅ **Bitrate limits**: Implemented
- ✅ **VP9 codec support**: Implemented
- ⏳ **S3 upload endpoint**: Pending
- ⏳ **S3 integration in interview page**: Pending
- ⏳ **Backend S3 URL storage**: Pending

