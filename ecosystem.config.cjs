/**
 * PM2 — Processos separados (regra arquitetural)
 * Bot: discord.js (interações, eventos, buildCard)
 * API: Fastify (dashboard + config via Discord OAuth2)
 */
module.exports = {
  apps: [
    {
      name: 'fdb-discord-bot',
      script: './apps/bot/dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
        DATABASE_URL: process.env.DATABASE_URL,
      },
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/bot-err.log',
      out_file: './logs/bot-out.log',
    },
    {
      name: 'fdb-discord-api',
      script: './apps/api/dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
      },
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/api-err.log',
      out_file: './logs/api-out.log',
    },
  ],
};
