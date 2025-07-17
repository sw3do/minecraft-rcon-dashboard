'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ServerInfo {
  playerList: string;
  tps: string;
  memory: string;
  version: string;
  difficulty: string;
  gamemode: string;
  time: string;
  weather: string;
}

interface PlayerInfo {
  gamemode: string;
  health: string;
  food: string;
  xp: string;
  inventory: string;
  location: string;
}

export default function Dashboard() {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [command, setCommand] = useState('');
  const [commandResult, setCommandResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [commandLoading, setCommandLoading] = useState(false);


  const fetchServerInfo = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await fetch('/api/rcon/server-info');
      const data = await response.json();
      
      if (data.success) {
        setServerInfo(data.data);
        setConnected(true);
        setLastRefresh(new Date());
      } else {
        setConnected(false);
      }
    } catch {
      console.error('Failed to fetch server info');
      setConnected(false);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchPlayerInfo = async (playerName: string) => {
    if (!playerName) return;
    
    try {
      const response = await fetch('/api/rcon/player-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName })
      });
      const data = await response.json();
      
      if (data.success) {
        setPlayerInfo(data.data);
      }
    } catch {
      console.error('Failed to fetch player info');
    }
  };

  const executeCommand = async () => {
    if (!command) return;
    
    try {
      setCommandLoading(true);
      const response = await fetch('/api/rcon/server-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const data = await response.json();
      
      if (data.success) {
        setCommandResult(data.data);
      } else {
        setCommandResult('Error: ' + data.error);
      }
    } catch {
      setCommandResult('Error: Failed to execute command');
    } finally {
      setCommandLoading(false);
    }
  };



  useEffect(() => {
    fetchServerInfo();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => fetchServerInfo(false), 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  useEffect(() => {
    if (selectedPlayer) {
      fetchPlayerInfo(selectedPlayer);
    }
  }, [selectedPlayer]);

  const getPlayerCount = (playerList: string) => {
    if (!playerList) return '0';
    const match = playerList.match(/There are (\d+)/);
    return match ? match[1] : '0';
  };

  const getOnlinePlayers = (playerList: string) => {
    if (!playerList) return [];
    
    console.log('Raw player list response:', playerList);
    
    let match = playerList.match(/online: (.+)$/);
    if (match) {
      const players = match[1].split(', ').filter(name => name.trim());
      console.log('Parsed players (online format):', players);
      return players;
    }
    
    match = playerList.match(/There are \d+ of a max of \d+ players online: (.+)/);
    if (match) {
      const players = match[1].split(', ').filter(name => name.trim());
      console.log('Parsed players (full format):', players);
      return players;
    }
    
    match = playerList.match(/There are \d+ out of maximum \d+ players online: (.+)/);
    if (match) {
      const players = match[1].split(', ').filter(name => name.trim());
      console.log('Parsed players (out of format):', players);
      return players;
    }
    
    if (playerList.includes('There are 0')) {
      console.log('No players online detected');
      return [];
    }
    
    const lines = playerList.split('\n');
    for (const line of lines) {
      if (line.includes(':') && !line.includes('There are')) {
        const parts = line.split(':');
        if (parts.length > 1) {
          const playersPart = parts[1].trim();
          if (playersPart) {
            const players = playersPart.split(', ').filter(name => name.trim());
            console.log('Parsed players (colon format):', players);
            return players;
          }
        }
      }
    }
    
    console.log('Could not parse players from:', playerList);
    return [];
  };

  return (
    <div className="min-h-screen text-white" style={{background: 'linear-gradient(to bottom, #1a1a1a, #2d2d30, #000000)', fontFamily: 'monospace'}}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold"
            style={{color: '#55FF55', textShadow: '2px 2px 0px #003300, 4px 4px 8px rgba(0,0,0,0.8)', fontFamily: 'monospace'}}
          >
            Server Dashboard
          </motion.h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchServerInfo()}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  autoRefresh ? 'bg-green-300 animate-pulse' : 'bg-gray-400'
                }`}></div>
                Auto Refresh
              </button>
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connected ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              {connected ? 'Connected' : 'Disconnected'}
            </div>
            
            {lastRefresh && (
              <div className="text-xs text-gray-400">
                Last: {lastRefresh.toLocaleTimeString()}
              </div>
            )}
            
            <Link
              href="/"
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl p-6 shadow-xl"
            style={{backgroundColor: '#2C2C2C', border: '2px solid #8B8B8B', boxShadow: 'inset -2px -2px 0px #000000, inset 2px 2px 0px #555555'}}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold" style={{color: '#FFFF55', textShadow: '2px 2px 0px #AAAA00'}}>§e§lServer Status</h2>
            </div>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            ) : serverInfo ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{color: '#AAAAAA'}}>§7Players Online:</span>
                  <span className="font-semibold" style={{color: '#FFFFFF'}}>§f{getPlayerCount(serverInfo.playerList)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{color: '#AAAAAA'}}>§7Version:</span>
                  <span className="font-semibold text-sm" style={{color: '#FFFFFF'}}>§f{serverInfo.version?.substring(0, 30)}...</span>
                </div>
                <div className="flex justify-between">
                  <span style={{color: '#AAAAAA'}}>§7Difficulty:</span>
                  <span className="font-semibold" style={{color: '#FFFFFF'}}>§f{serverInfo.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{color: '#AAAAAA'}}>§7Time:</span>
                  <span className="font-semibold" style={{color: '#FFFFFF'}}>§f{serverInfo.time}</span>
                </div>
              </div>
            ) : (
              <p style={{color: '#FF5555', fontWeight: 'bold'}}>§c§lFailed to connect to server</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold" style={{color: '#AA00FF', textShadow: '2px 2px 0px #330033'}}>§d§lOnline Players</h2>
            </div>
            {serverInfo ? (
              <div className="space-y-2">
                {getOnlinePlayers(serverInfo.playerList).map((player, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPlayer(player)}
                    className="w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3"
                    style={{
                      backgroundColor: selectedPlayer === player ? '#663399' : '#404040',
                      border: selectedPlayer === player ? '2px solid #AA00FF' : '2px inset #8B8B8B',
                      boxShadow: selectedPlayer === player ? '0 0 10px rgba(170,0,255,0.5)' : 'inset -1px -1px 0px #333333, inset 1px 1px 0px #999999'
                    }}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      selectedPlayer === player ? 'bg-purple-400' : 'bg-green-400'
                    }`}></div>
                    <span className="font-medium" style={{color: '#FFFFFF'}}>§f{player}</span>
                    {selectedPlayer === player && (
                      <svg className="w-4 h-4 ml-auto text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
                {getOnlinePlayers(serverInfo.playerList).length === 0 && (
                  <p className="text-center py-4" style={{color: '#AAAAAA'}}>§7No players online</p>
                )}
              </div>
            ) : (
              <p style={{color: '#AAAAAA'}}>§7Loading...</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold" style={{color: '#55FF55', textShadow: '2px 2px 0px #003300'}}>§a§lPlayer Info</h2>
            </div>
            {selectedPlayer ? (
              playerInfo ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span style={{color: '#AAAAAA'}}>§7Player:</span>
                    <span className="font-semibold" style={{color: '#FFFFFF'}}>§f{selectedPlayer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{color: '#AAAAAA'}}>§7Gamemode:</span>
                    <span className="font-semibold" style={{color: '#FFFFFF'}}>§f{playerInfo.gamemode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{color: '#AAAAAA'}}>§7Health:</span>
                    <span className="font-semibold" style={{color: '#FF5555'}}>§c{playerInfo.health}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{color: '#AAAAAA'}}>§7Food Level:</span>
                    <span className="font-semibold" style={{color: '#FFAA00'}}>§6{playerInfo.food}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{color: '#AAAAAA'}}>§7XP Level:</span>
                    <span className="font-semibold" style={{color: '#55FFFF'}}>§b{playerInfo.xp}</span>
                  </div>
                </div>
              ) : (
                <p style={{color: '#AAAAAA'}}>§7Loading player info...</p>
              )
            ) : (
              <p className="text-center py-4" style={{color: '#AAAAAA'}}>§7Select a player to view info</p>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold" style={{color: '#FFFF55', textShadow: '2px 2px 0px #AAAA00'}}>§e§lCommand Console</h2>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Enter RCON command..."
                  className="flex-1 rounded-lg px-3 py-2 text-white focus:outline-none"
                  style={{backgroundColor: '#404040', border: '2px inset #8B8B8B', color: '#FFFFFF'}}
                  onFocus={(e) => (e.target as HTMLInputElement).style.boxShadow = '0 0 10px rgba(85,255,85,0.5)'}
                onBlur={(e) => (e.target as HTMLInputElement).style.boxShadow = 'inset -2px -2px 0px #000000, inset 2px 2px 0px #555555'}
                  onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
                />
                <button
                  onClick={executeCommand}
                  disabled={commandLoading || !command.trim()}
                  className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 min-w-[100px] justify-center"
                  style={{backgroundColor: (commandLoading || !command.trim()) ? '#666666' : '#0066CC', color: '#FFFFFF', border: '2px outset #8B8B8B', cursor: (commandLoading || !command.trim()) ? 'not-allowed' : 'pointer'}}
                  onMouseEnter={(e) => (commandLoading || !command.trim()) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#0088FF')}
                  onMouseLeave={(e) => (commandLoading || !command.trim()) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#0066CC')}
                >
                  {commandLoading ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Execute'
                  )}
                </button>
              </div>
              
              {commandResult && (
                <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg p-4"
                style={{backgroundColor: '#2C2C2C', border: '2px inset #8B8B8B'}}
              >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium" style={{color: '#AAAAAA'}}>§7Command Output</span>
                    <button
                      onClick={() => setCommandResult('')}
                      className="ml-auto text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <pre className="text-sm whitespace-pre-wrap font-mono" style={{color: '#55FF55'}}>{commandResult}</pre>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold" style={{color: '#FFAA00', textShadow: '2px 2px 0px #AA5500'}}>§6§lPlugin Controls</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{color: '#55FF55'}}>§aPlayer Commands</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setCommand(`effect give ${selectedPlayer} minecraft:instant_health 1 255`);
                      executeCommand();
                    }}
                    disabled={!selectedPlayer || commandLoading}
                    className="px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
                    style={{backgroundColor: (!selectedPlayer || commandLoading) ? '#666666' : '#00AA00', color: '#FFFFFF', border: '2px outset #8B8B8B', cursor: (!selectedPlayer || commandLoading) ? 'not-allowed' : 'pointer'}}
                    onMouseEnter={(e) => (!selectedPlayer || commandLoading) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#00CC00')}
                    onMouseLeave={(e) => (!selectedPlayer || commandLoading) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#00AA00')}
                  >
                    {commandLoading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                    §a§lHeal
                  </button>
                  <button
                    onClick={() => {
                      setCommand(`effect give ${selectedPlayer} minecraft:saturation 1 255`);
                      executeCommand();
                    }}
                    disabled={!selectedPlayer || commandLoading}
                    className="px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
                    style={{backgroundColor: (!selectedPlayer || commandLoading) ? '#666666' : '#0066CC', color: '#FFFFFF', border: '2px outset #8B8B8B', cursor: (!selectedPlayer || commandLoading) ? 'not-allowed' : 'pointer'}}
                    onMouseEnter={(e) => (!selectedPlayer || commandLoading) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#0088FF')}
                    onMouseLeave={(e) => (!selectedPlayer || commandLoading) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#0066CC')}
                  >
                    {commandLoading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zM3 9a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    )}
                    §9§lFeed
                  </button>
                  <button
                    onClick={() => {
                      setCommand(`gamemode creative ${selectedPlayer}`);
                      executeCommand();
                    }}
                    disabled={!selectedPlayer || commandLoading}
                    className="px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
                    style={{backgroundColor: (!selectedPlayer || commandLoading) ? '#666666' : '#AA00AA', color: '#FFFFFF', border: '2px outset #8B8B8B', cursor: (!selectedPlayer || commandLoading) ? 'not-allowed' : 'pointer'}}
                    onMouseEnter={(e) => (!selectedPlayer || commandLoading) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#CC00CC')}
                    onMouseLeave={(e) => (!selectedPlayer || commandLoading) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#AA00AA')}
                  >
                    {commandLoading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                    §d§lCreative
                  </button>
                  <button
                    onClick={() => {
                      setCommand(`gamemode survival ${selectedPlayer}`);
                      executeCommand();
                    }}
                    disabled={!selectedPlayer || commandLoading}
                    className="px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
                    style={{backgroundColor: (!selectedPlayer || commandLoading) ? '#666666' : '#FFAA00', color: '#FFFFFF', border: '2px outset #8B8B8B', cursor: (!selectedPlayer || commandLoading) ? 'not-allowed' : 'pointer'}}
                    onMouseEnter={(e) => (!selectedPlayer || commandLoading) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#FFCC00')}
                    onMouseLeave={(e) => (!selectedPlayer || commandLoading) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#FFAA00')}
                  >
                    {commandLoading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                    §6§lSurvival
                  </button>
                  <button
                    onClick={() => {
                      setCommand(`tp ${selectedPlayer} ~ ~10 ~`);
                      executeCommand();
                    }}
                    disabled={!selectedPlayer || commandLoading}
                    className="px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
                    style={{backgroundColor: (!selectedPlayer || commandLoading) ? '#666666' : '#5555FF', color: '#FFFFFF', border: '2px outset #8B8B8B', cursor: (!selectedPlayer || commandLoading) ? 'not-allowed' : 'pointer'}}
                    onMouseEnter={(e) => (!selectedPlayer || commandLoading) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#7777FF')}
                    onMouseLeave={(e) => (!selectedPlayer || commandLoading) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#5555FF')}
                  >
                    {commandLoading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    )}
                    §5§lTeleport Up
                  </button>
                  <button
                    onClick={() => {
                      setCommand(`give ${selectedPlayer} minecraft:diamond 64`);
                      executeCommand();
                    }}
                    disabled={!selectedPlayer || commandLoading}
                    className="px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
                    style={{backgroundColor: (!selectedPlayer || commandLoading) ? '#666666' : '#00AAAA', color: '#FFFFFF', border: '2px outset #8B8B8B', cursor: (!selectedPlayer || commandLoading) ? 'not-allowed' : 'pointer'}}
                    onMouseEnter={(e) => (!selectedPlayer || commandLoading) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#00CCCC')}
                    onMouseLeave={(e) => (!selectedPlayer || commandLoading) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#00AAAA')}
                  >
                    {commandLoading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    )}
                    §3§lGive Diamonds
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{color: '#FFAA00'}}>§6Server Management</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setCommand(`kick ${selectedPlayer} Kicked from dashboard`);
                      executeCommand();
                    }}
                    disabled={!selectedPlayer || commandLoading}
                    className="px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
                    style={{backgroundColor: (!selectedPlayer || commandLoading) ? '#666666' : '#FF5555', color: '#FFFFFF', border: '2px outset #8B8B8B', cursor: (!selectedPlayer || commandLoading) ? 'not-allowed' : 'pointer'}}
                    onMouseEnter={(e) => (!selectedPlayer || commandLoading) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#FF7777')}
                    onMouseLeave={(e) => (!selectedPlayer || commandLoading) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#FF5555')}
                  >
                    {commandLoading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    )}
                    §c§lKick
                  </button>
                  <button
                    onClick={() => {
                      setCommand(`ban ${selectedPlayer} Banned from dashboard`);
                      executeCommand();
                    }}
                    disabled={!selectedPlayer || commandLoading}
                    className="px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
                    style={{backgroundColor: (!selectedPlayer || commandLoading) ? '#666666' : '#AA0000', color: '#FFFFFF', border: '2px outset #8B8B8B', cursor: (!selectedPlayer || commandLoading) ? 'not-allowed' : 'pointer'}}
                    onMouseEnter={(e) => (!selectedPlayer || commandLoading) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#CC0000')}
                    onMouseLeave={(e) => (!selectedPlayer || commandLoading) ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#AA0000')}
                  >
                    {commandLoading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                    )}
                    §4§lBan
                  </button>
                  <button
                    onClick={() => {
                      setCommand('plugins');
                      executeCommand();
                    }}
                    disabled={commandLoading}
                    className="px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
                    style={{backgroundColor: commandLoading ? '#666666' : '#00AAAA', color: '#FFFFFF', border: '2px outset #8B8B8B', cursor: commandLoading ? 'not-allowed' : 'pointer'}}
                    onMouseEnter={(e) => commandLoading ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#00CCCC')}
                  onMouseLeave={(e) => commandLoading ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#00AAAA')}
                  >
                    {commandLoading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    )}
                    §3§lCheck Plugins
                  </button>
                  <button
                    onClick={() => {
                      setCommand('whitelist list');
                      executeCommand();
                    }}
                    disabled={commandLoading}
                    className="px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
                    style={{backgroundColor: commandLoading ? '#666666' : '#00AA00', color: '#FFFFFF', border: '2px outset #8B8B8B', cursor: commandLoading ? 'not-allowed' : 'pointer'}}
                    onMouseEnter={(e) => commandLoading ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#00CC00')}
                  onMouseLeave={(e) => commandLoading ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#00AA00')}
                  >
                    {commandLoading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    )}
                    §a§lWhitelist
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{color: '#55FFFF'}}>§bWorld Controls</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setCommand('time set day');
                      executeCommand();
                    }}
                    disabled={commandLoading}
                    className="px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
                    style={{backgroundColor: commandLoading ? '#666666' : '#FFAA00', color: '#FFFFFF', border: '2px outset #8B8B8B', cursor: commandLoading ? 'not-allowed' : 'pointer'}}
                    onMouseEnter={(e) => commandLoading ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#FFCC00')}
                  onMouseLeave={(e) => commandLoading ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#FFAA00')}
                  >
                    {commandLoading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                    §6§lSet Day
                  </button>
                  <button
                    onClick={() => {
                      setCommand('time set night');
                      executeCommand();
                    }}
                    disabled={commandLoading}
                    className="px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
                    style={{backgroundColor: commandLoading ? '#666666' : '#555555', color: '#FFFFFF', border: '2px outset #8B8B8B', cursor: commandLoading ? 'not-allowed' : 'pointer'}}
                    onMouseEnter={(e) => commandLoading ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#777777')}
                  onMouseLeave={(e) => commandLoading ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#555555')}
                  >
                    {commandLoading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                    §8§lSet Night
                  </button>
                  <button
                    onClick={() => {
                      setCommand('weather clear');
                      executeCommand();
                    }}
                    disabled={commandLoading}
                    className="px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
                    style={{backgroundColor: commandLoading ? '#666666' : '#55FFFF', color: '#000000', border: '2px outset #8B8B8B', cursor: commandLoading ? 'not-allowed' : 'pointer'}}
                    onMouseEnter={(e) => commandLoading ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#77FFFF')}
                  onMouseLeave={(e) => commandLoading ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#55FFFF')}
                  >
                    {commandLoading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                    )}
                    §b§lClear Weather
                  </button>
                  <button
                    onClick={() => {
                      setCommand('weather rain');
                      executeCommand();
                    }}
                    disabled={commandLoading}
                    className="px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
                    style={{backgroundColor: commandLoading ? '#666666' : '#0000AA', color: '#FFFFFF', border: '2px outset #8B8B8B', cursor: commandLoading ? 'not-allowed' : 'pointer'}}
                    onMouseEnter={(e) => commandLoading ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#0000CC')}
                  onMouseLeave={(e) => commandLoading ? null : ((e.target as HTMLButtonElement).style.backgroundColor = '#0000AA')}
                  >
                    {commandLoading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4l8 8-8 8V4z" />
                      </svg>
                    )}
                    §1§lMake Rain
                  </button>
                </div>
              </div>
              
              {!selectedPlayer && (
                <p className="text-sm text-center" style={{color: '#AAAAAA'}}>§7Select a player to use plugin controls</p>
              )}
            </div>
          </motion.div>
        </div>

        {serverInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold" style={{color: '#FF5555', textShadow: '2px 2px 0px #AA0000'}}>§c§lDebug Info</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium" style={{color: '#FFAA00'}}>§6Raw Player List Response:</span>
                <pre className="mt-1 rounded-lg p-3 text-xs whitespace-pre-wrap font-mono overflow-x-auto" style={{backgroundColor: '#404040', border: '2px inset #8B8B8B', color: '#AAAAAA'}}>
                  {serverInfo.playerList || 'No response'}
                </pre>
              </div>
              <div>
                <span className="text-sm font-medium" style={{color: '#55FF55'}}>§aParsed Players:</span>
                <pre className="mt-1 rounded-lg p-3 text-xs whitespace-pre-wrap font-mono" style={{backgroundColor: '#404040', border: '2px inset #8B8B8B', color: '#55FF55'}}>
                  {JSON.stringify(getOnlinePlayers(serverInfo.playerList), null, 2)}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}