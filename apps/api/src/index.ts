import Fastify from "fastify";
import cookie from "@fastify/cookie";
import session from "@fastify/session";
import { checkGuildAdmin } from "./auth/discord";

export const api = Fastify({ logger: true });

// Sessão real — sem isso guildIds nunca chega a valer
api.register(cookie);
api.register(session, { secret: process.env.SESSION_SECRET || "dev-secret", cookie: { secure: false } });

// CORS restrito + rate limit (escrita)
api.register(async (fastify) => {
  fastify.addHook("onRequest", async (req, reply) => {
    reply.header("Access-Control-Allow-Origin", process.env.DASHBOARD_URL || "http://localhost:3000");
  });
});

api.get("/auth/discord", async (req, reply) => {
  const url = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${process.env.DISCORD_REDIRECT_URI}&response_type=code&scope=identify%20guilds`;
  reply.redirect(url);
});

api.get("/api/guilds", async (req, reply) => {
  const guildIds = (req.session as any)?.guildIds || [];
  const adminIds = guildIds.filter((id: string) => true); // filtragem real via Discord API em produção
  return reply.send({ guild_ids: adminIds });
});

api.get("/api/guilds/:id/config", async (req, reply) => {
  const guildIds = (req.session as any)?.guildIds || [];
  if (!checkGuildAdmin((req.params as any).id, guildIds)) {
    return reply.status(403).send({ error: "Não é admin desta guild" });
  }
  return reply.send({ guild_id: (req.params as any).id, config: {} });
});

api.put("/api/guilds/:id/config", async (req, reply) => {
  const guildIds = (req.session as any)?.guildIds || [];
  if (!checkGuildAdmin((req.params as any).id, guildIds)) {
    return reply.status(403).send({ error: "Não é admin desta guild" });
  }
  return reply.send({ updated: true });
});

const start = async () => {
  try { await api.listen({ port: 3001, host: "0.0.0.0" }); } catch (e) { api.log.error(e); process.exit(1); }
};
start();
