import { NextRequest, NextResponse } from 'next/server';
import MinecraftRcon from '@/lib/rcon';

export async function POST(request: NextRequest) {
  try {
    const { plugin, action, params } = await request.json();
    
    if (!plugin || !action) {
      return NextResponse.json(
        { success: false, error: 'Plugin and action are required' },
        { status: 400 }
      );
    }

    const rcon = new MinecraftRcon({
      host: process.env.RCON_HOST || 'localhost',
      port: parseInt(process.env.RCON_PORT || '25575'),
      password: process.env.RCON_PASSWORD || ''
    });

    await rcon.connect();
    const result = await rcon.executePluginCommand(plugin, action, params);
    await rcon.disconnect();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Plugin command error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute plugin command' },
      { status: 500 }
    );
  }
}