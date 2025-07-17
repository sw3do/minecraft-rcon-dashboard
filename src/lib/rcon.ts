import { Rcon } from 'rcon-client';

interface RconConfig {
  host: string;
  port: number;
  password: string;
}

class MinecraftRcon {
  private rcon: Rcon | null = null;
  private config: RconConfig;

  constructor(config: RconConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      this.rcon = new Rcon({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
      });
      await this.rcon.connect();
    } catch (error) {
      console.error('Failed to connect to RCON:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.rcon) {
      await this.rcon.end();
      this.rcon = null;
    }
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.rcon) {
      throw new Error('RCON not connected');
    }
    try {
      const response = await this.rcon.send(command);
      return response;
    } catch (error) {
      console.error('Failed to send command:', error);
      throw error;
    }
  }

  async getServerInfo(): Promise<Record<string, string>> {
    const commands = {
      playerList: 'list',
      tps: 'forge tps',
      memory: 'forge track start',
      version: 'version',
      difficulty: 'difficulty',
      gamemode: 'defaultgamemode',
      time: 'time query daytime',
      weather: 'weather query'
    };

    const results: Record<string, string> = {};
    
    for (const [key, command] of Object.entries(commands)) {
      try {
        results[key] = await this.sendCommand(command);
      } catch (error) {
        results[key] = `Error: ${error}`;
      }
    }

    return results;
  }

  async getPlayerInfo(playerName: string): Promise<Record<string, string>> {
    const commands = {
      gamemode: `data get entity ${playerName} playerGameType`,
      health: `data get entity ${playerName} Health`,
      food: `data get entity ${playerName} foodLevel`,
      xp: `data get entity ${playerName} XpLevel`,
      inventory: `data get entity ${playerName} Inventory`,
      location: `data get entity ${playerName} Pos`
    };

    const results: Record<string, string> = {};
    
    for (const [key, command] of Object.entries(commands)) {
      try {
        results[key] = await this.sendCommand(command);
      } catch (error) {
        results[key] = `Error: ${error}`;
      }
    }

    return results;
  }

  async executePluginCommand(plugin: string, action: string, params?: string): Promise<string> {
    const pluginCommands: { [key: string]: { [key: string]: string } } = {
      essentials: {
        fly: `fly ${params}`,
        god: `god ${params}`,
        heal: `heal ${params}`,
        feed: `feed ${params}`,
        tp: `tp ${params}`,
        ban: `ban ${params}`,
        kick: `kick ${params}`,
        mute: `mute ${params}`
      },
      worldedit: {
        pos1: `//pos1`,
        pos2: `//pos2`,
        copy: `//copy`,
        paste: `//paste`,
        undo: `//undo`,
        redo: `//redo`
      },
      luckperms: {
        addperm: `lp user ${params} permission set`,
        removeperm: `lp user ${params} permission unset`,
        addgroup: `lp user ${params} parent add`,
        removegroup: `lp user ${params} parent remove`
      }
    };

    const command = pluginCommands[plugin]?.[action];
    if (!command) {
      throw new Error(`Unknown plugin command: ${plugin}.${action}`);
    }

    return await this.sendCommand(command);
  }
}

export default MinecraftRcon;
export type { RconConfig };