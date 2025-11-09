import { NextRequest, NextResponse } from 'next/server';
import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { initializeSocketServer } from '@/server/socket-server';

let io: Server | null = null;

export async function GET(req: NextRequest) {
  if (!io) {
    // In Next.js 13+ App Router, we need to attach to the Node.js server
    // This is a workaround since App Router doesn't expose the HTTP server directly
    return NextResponse.json({ 
      error: 'Socket.IO server needs to be initialized in a custom server setup' 
    }, { status: 500 });
  }

  return NextResponse.json({ connected: true });
}
