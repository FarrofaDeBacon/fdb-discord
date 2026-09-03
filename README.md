# FDB Discord — Multi-tenant SaaS Bot

Bot Discord multi-tenant com moderação, tickets, whitelist e dashboard de configuração.

## Stack
- **Bot**: discord.js v14+ (Components V2)
- **API**: Fastify + TypeScript
- **Dashboard**: SvelteKit + Discord OAuth2
- **Banco**: PostgreSQL + Prisma
- **Cache**: node-cache
- **Process**: PM2

## Estrutura

```
fdb-discord/
├── apps/
│   ├── bot/           # Discord bot
│   ├── api/           # Fastify API + Discord OAuth
│   └── dashboard/     # SvelteKit dashboard
├── packages/
│   └── shared/        # Tipos, helpers, buildCard
├── prisma/            # Schema + migrations
└── ecosystem.config.cjs  # PM2 config
```

## Princípio
**Isolamento por guild é lei.** Toda tabela relevante tem `guild_id` como FK obrigatória. Repository pattern força o filtro.

## Protocolo de commit
Hash real por fase. Auditoria antes de avançar.

---
*Fase 1 — Fundação*
