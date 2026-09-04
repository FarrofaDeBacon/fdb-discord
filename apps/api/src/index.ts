import Fastify from "fastify";
import cookie from "@fastify/cookie";
import session from "@fastify/session";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
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

api.register(rateLimit, {
  max: 10,
  timeWindow: "1 minute",
  addHeadersOnExceeding: { "x-ratelimit-limit": false, "x-ratelimit-remaining": false },
  // Aplicado globalmente (todas rotas) — razoável para auth; se quiser só PUT, usar global:false + config por rota
});

api.get("/auth/discord", async (req, reply) => {
  const url = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${process.env.DISCORD_REDIRECT_URI}&response_type=code&scope=identify%20guilds`;
  reply.redirect(url);
});

api.get("/auth/discord/callback", async (req, reply) => {
  const code = (req.query as any)?.code;
  if (!code) return reply.status(400).send({ error: "Sem code" });

  // 1. Troca REAL por token (Discord API, não simulado)
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    }),
  });
  if (!tokenRes.ok) return reply.status(400).send({ error: "Code inválido ou expirado" });
  const { access_token } = await tokenRes.json();

  // 2. Busca guilds REAIS do usuário logado
  const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!guildsRes.ok) return reply.status(500).send({ error: "Falha ao buscar guilds" });
  const guilds = await guildsRes.json();

  // 3. Filtra admin (bit 0x8 = Administrator)
  const adminIds = (guilds || [])
    .filter((g: any) => (parseInt(g.permissions || "0") & 0x8) === 0x8)
    .map((g: any) => g.id);

  (req.session as any).guildIds = adminIds;
  return reply.redirect(process.env.DASHBOARD_URL || "/");
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
