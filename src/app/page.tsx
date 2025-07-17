'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            Minecraft RCON Dashboard
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
          >
            Real-time server management, player monitoring, and plugin control for your Minecraft server.
            Monitor everything from player stats to server performance in one beautiful dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Open Dashboard
            </Link>
            <a
              href="#features"
              className="border border-gray-400 hover:border-white text-gray-300 hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300"
            >
              Learn More
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          id="features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700"
          >
            <div className="text-blue-400 text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-3">Real-time Monitoring</h3>
            <p className="text-gray-400">
              Monitor server status, player count, TPS, and performance metrics in real-time.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700"
          >
            <div className="text-purple-400 text-3xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-3">Player Management</h3>
            <p className="text-gray-400">
              View player stats, inventory, gamemode, health, and manage permissions easily.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700"
          >
            <div className="text-green-400 text-3xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold mb-3">Plugin Control</h3>
            <p className="text-gray-400">
              Manage popular plugins like Essentials, WorldEdit, and LuckPerms from the dashboard.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 text-sm">
            Configure your RCON settings in .env.local and start managing your server
          </p>
        </motion.div>
      </div>
    </div>
  );
}
