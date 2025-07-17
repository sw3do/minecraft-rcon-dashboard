import { NextRequest, NextResponse } from 'next/server';
import MinecraftRcon from '@/lib/rcon';

export async function POST(request: NextRequest) {
  try {
    const { playerName } = await request.json();
    
    if (!playerName) {
      return NextResponse.json(
        { success: false, error: 'Player name is required' },
        { status: 400 }
      );
    }

    const rcon = new MinecraftRcon({
      host: process.env.RCON_HOST || 'localhost',
      port: parseInt(process.env.RCON_PORT || '25575'),
      password: process.env.RCON_PASSWORD || ''
    });

    await rcon.connect();
    const playerInfo = await rcon.getPlayerInfo(playerName);
    await rcon.disconnect();

    return NextResponse.json({ success: true, data: playerInfo });
  } catch (error) {
    console.error('Player info error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch player info' },
      { status: 500 }
    );
  }
}