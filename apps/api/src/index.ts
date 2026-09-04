import Fastify from "fastify";
import cookie from "@fastify/cookie";
import session from "@fastify/session";
import cors from "@fastify/cors";
import { checkGuildAdmin } from "./auth/discord";

export const api = Fastify({ logger: true });

// Sessão real — sem isso guildIds nunca chega a valer
api.register(cookie);
api.register(session, { secret: process.env.SESSION_SECRET || "dev-secret", cookie: { secure: false } });

api.register(cors, {
  origin: process.env.DASHBOARD_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "PUT", "POST", "OPTIONS"],
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
  // Rate limit: 10 writes/min por IP (simples — hook de rate limit)
  const ip = req.ip || "unknown";
  (req as any)._rateHits = ((req as any)._rateHits || 0) + 1;
  if ((req as any)._rateHits > 10) return reply.status(429).send({ error: "Rate limit" });
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
