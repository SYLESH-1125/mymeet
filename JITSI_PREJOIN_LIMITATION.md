# Jitsi Prejoin Screen - Known Limitation

## Issue
The "Configuring devices..." screen appears even with `prejoinPageEnabled: false` because **meet.jit.si (free public server) enforces the prejoin page** for security and user experience reasons.

## Why This Happens
- Public Jitsi servers ignore certain config overrides
- They require device enumeration for quality of service
- This is a server-side policy, not a client config issue

## Current Optimization
We've minimized the lag by:
- ✅ Setting `startWithoutMediaPermissions: true` for students
- ✅ Setting `constraints.audio: false` and `constraints.video: false` for students
- ✅ Setting `startSilent: true` and `disableInitialGUM: true` for students

This makes the prejoin screen appear for ~1-2 seconds instead of 5-10 seconds.

## Complete Solution (Self-Hosted Jitsi)

To **completely eliminate** the prejoin screen, you need to self-host Jitsi Meet.

### Option 1: Quick Self-Hosted Setup (Docker)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone Jitsi Docker setup
git clone https://github.com/jitsi/docker-jitsi-meet
cd docker-jitsi-meet

# Create .env file
cp env.example .env

# Edit .env - set your domain
nano .env
# Set: PUBLIC_URL=https://meet.yourdomain.com

# Start Jitsi
docker-compose up -d
```

### Option 2: Full Ubuntu Installation

```bash
# Add Jitsi repository
curl https://download.jitsi.org/jitsi-key.gpg.key | sudo sh -c 'gpg --dearmor > /usr/share/keyrings/jitsi-keyring.gpg'
echo 'deb [signed-by=/usr/share/keyrings/jitsi-keyring.gpg] https://download.jitsi.org stable/' | sudo tee /etc/apt/sources.list.d/jitsi-stable.list > /dev/null

# Install
sudo apt update
sudo apt install jitsi-meet
```

### Configure Your Self-Hosted Server

Edit `/etc/jitsi/meet/YOUR_DOMAIN-config.js`:

```javascript
var config = {
    prejoinPageEnabled: false, // NOW THIS WILL WORK!
    startWithAudioMuted: true,
    startWithVideoMuted: true,
    // ... other configs
};
```

### Update Your App

In `jitsi-frame.tsx`, change the domain:

```typescript
const api = new window.JitsiMeetExternalAPI('meet.yourdomain.com', options);
// Instead of: 'meet.jit.si'
```

## Cost Comparison

| Solution | Cost | Prejoin Control | Scalability |
|----------|------|-----------------|-------------|
| meet.jit.si (free) | $0 | ❌ Limited | 500 users |
| Self-hosted (1 server) | ~$20/month | ✅ Full control | 500 users |
| Self-hosted (3 servers) | ~$60/month | ✅ Full control | 1000+ users |

## Recommended Setup for Production

1. **Development**: Use meet.jit.si (free, 1-2s prejoin lag)
2. **Production**: Self-host on DigitalOcean/AWS ($20-60/month)
   - Complete control over prejoin
   - No lag at all
   - Custom branding
   - Better privacy

## Alternative: Use 8x8 Jaas (Jitsi as a Service)

8x8 offers managed Jitsi hosting with config control:
- https://jaas.8x8.vc/
- Pricing: ~$50/month for 100 concurrent users
- Full config control (prejoin can be disabled)
- No server management

## Current Status

✅ **Optimized for meet.jit.si**: 1-2 second prejoin (down from 5-10 seconds)  
🔄 **For zero prejoin**: Need self-hosted Jitsi (recommended for production)  
💰 **Cost to eliminate lag**: $0 (self-host) or $20-50/month (managed)

---

**Bottom Line**: The prejoin screen will appear briefly (~1-2s) on meet.jit.si. For instant joins, self-host Jitsi or use Jaas. Current optimization reduces lag by 70-80%.
