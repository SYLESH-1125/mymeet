/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  // Allow cross-origin requests in development
  allowedDevOrigins: [
    '192.168.1.2:3000',
  ],
  // Set workspace root
  turbopack: {
    root: process.cwd(),
  },
  // Allow external scripts from Jitsi and Google
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://meet.jit.si https://apis.google.com https://accounts.google.com; frame-src 'self' https://meet.jit.si https://accounts.google.com https://*.firebaseapp.com;",
          },
        ],
      },
    ];
  },
}

export default nextConfig

