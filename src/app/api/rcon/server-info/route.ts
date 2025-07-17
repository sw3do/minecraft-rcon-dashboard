import { NextRequest, NextResponse } from 'next/server';
import MinecraftRcon from '@/lib/rcon';

export async function GET() {
  try {
    const rcon = new MinecraftRcon({
      host: process.env.RCON_HOST || 'localhost',
      port: parseInt(process.env.RCON_PORT || '25575'),
      password: process.env.RCON_PASSWORD || ''
    });

    await rcon.connect();
    const serverInfo = await rcon.getServerInfo();
    await rcon.disconnect();

    return NextResponse.json({ success: true, data: serverInfo });
  } catch (error) {
    console.error('Server info error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch server info' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json();
    
    if (!command) {
      return NextResponse.json(
        { success: false, error: 'Command is required' },
        { status: 400 }
      );
    }

    const rcon = new MinecraftRcon({
      host: process.env.RCON_HOST || 'localhost',
      port: parseInt(process.env.RCON_PORT || '25575'),
      password: process.env.RCON_PASSWORD || ''
    });

    await rcon.connect();
    const result = await rcon.sendCommand(command);
    await rcon.disconnect();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Command execution error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute command' },
      { status: 500 }
    );
  }
}