import Fastify from "fastify";
import { getGuildAdminIds } from "./auth/discord";

export const api = Fastify({ logger: true });

// 6.1 — Segurança obrigatória: 403 se não é admin DA guild
api.get("/api/guilds/:id/config", async (req, reply) => {
  const sessionGuildIds = (req.session as any)?.guildIds || [];
  const guildId = (req.params as any).id;
  if (!sessionGuildIds.includes(guildId)) {
    return reply.status(403).send({ error: "Não é admin desta guild" });
  }
  return reply.send({ guild_id: guildId, config: {} });
});

api.put("/api/guilds/:id/config", async (req, reply) => {
  const sessionGuildIds = (req.session as any)?.guildIds || [];
  const guildId = (req.params as any).id;
  if (!sessionGuildIds.includes(guildId)) {
    return reply.status(403).send({ error: "Não é admin desta guild" });
  }
  return reply.send({ updated: true });
});

const start = async () => {
  try { await api.listen({ port: 3001, host: "0.0.0.0" }); } catch (e) { api.log.error(e); process.exit(1); }
};
start();
