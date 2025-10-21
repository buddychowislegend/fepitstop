# LiveKit Integration Setup Guide

## 🚀 Quick Start

### 1. Set up LiveKit Server

#### Option A: LiveKit Cloud (Recommended)
1. Go to [LiveKit Cloud](https://cloud.livekit.io/)
2. Sign up for a free account
3. Create a new project
4. Get your API Key, API Secret, and WebSocket URL

#### Option B: Self-hosted LiveKit Server
```bash
# Using Docker
docker run --rm -p 7880:7880 -p 7881:7881 -p 7882:7882/udp \
  -e LIVEKIT_KEYS="devkey: devsecret" \
  livekit/livekit-server:latest \
  --dev
```

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# LiveKit Configuration
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
LIVEKIT_WS_URL=wss://your-livekit-server.com
```

### 3. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/ai-interview-livekit`

3. The page will:
   - Generate a unique room for your interview
   - Connect to LiveKit video service
   - Start the AI interview with video capabilities

## 🎥 Features

### Video Conference
- **Real-time video/audio**: High-quality video calls
- **Screen sharing**: Share your screen during technical questions
- **Recording**: Optional video recording of the interview
- **Multiple participants**: Support for multiple interviewers

### AI Integration
- **Smart questions**: AI generates contextual interview questions
- **Real-time feedback**: Get instant feedback on your answers
- **Progress tracking**: Track your interview progress
- **Score calculation**: Get detailed scoring and feedback

## 🔧 Configuration

### Room Settings
- **Room names**: Auto-generated unique room IDs
- **Permissions**: Participants can publish/subscribe
- **Security**: Token-based authentication

### Video Settings
- **Resolution**: Adaptive based on connection
- **Codec**: VP8/VP9 for video, Opus for audio
- **Bandwidth**: Auto-adaptive

## 🚨 Troubleshooting

### Common Issues

1. **"Failed to connect to video service"**
   - Check your LiveKit credentials
   - Verify the WebSocket URL is correct
   - Ensure your LiveKit server is running

2. **"Token generation failed"**
   - Verify API Key and Secret are correct
   - Check server logs for detailed errors

3. **Video not showing**
   - Check browser permissions for camera/microphone
   - Ensure HTTPS in production (required for media access)

### Browser Support
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 11+)
- **Edge**: Full support

## 📱 Mobile Support

LiveKit works on mobile devices with:
- **iOS**: Safari, Chrome, Firefox
- **Android**: Chrome, Firefox, Samsung Internet

## 🔒 Security

- **Token-based authentication**: Secure room access
- **HTTPS required**: For production deployments
- **Room isolation**: Each interview gets a unique room
- **Permission controls**: Granular access control

## 📊 Analytics

Track interview metrics:
- **Connection quality**: Monitor video/audio quality
- **Duration**: Track interview length
- **Participant count**: Monitor active participants
- **Error rates**: Track connection issues

## 🚀 Production Deployment

### Environment Setup
1. Set up production LiveKit server
2. Configure SSL certificates
3. Set up monitoring and logging
4. Configure CDN for optimal performance

### Scaling
- **Horizontal scaling**: Multiple LiveKit servers
- **Load balancing**: Distribute connections
- **Geographic distribution**: Regional servers

## 📞 Support

- **Documentation**: [LiveKit Docs](https://docs.livekit.io/)
- **Community**: [LiveKit Discord](https://discord.gg/livekit)
- **GitHub**: [LiveKit GitHub](https://github.com/livekit)

## 🎯 Next Steps

1. **Set up your LiveKit server** (cloud or self-hosted)
2. **Configure environment variables**
3. **Test the integration**
4. **Customize the UI** to match your brand
5. **Deploy to production**

Your AI interview system is now ready with professional video capabilities! 🎉
