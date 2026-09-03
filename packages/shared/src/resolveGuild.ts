import { PrismaClient } from '@prisma/client';

/**
 * Resolve snowflake Discord → UUID interno do Guild.
 * Uso obrigatório antes de qualquer write em tabela com guild_id FK.
 * Evita violação de FK no Postgres (Guild.id é UUID, guild_id snowflake).
 */
export async function resolveGuildUuid(prisma: PrismaClient, discordGuildId: string, guildName?: string): Promise<string> {
  const guild = await prisma.guild.upsert({
    where: { guild_id: discordGuildId },
    update: {},
    create: { guild_id: discordGuildId, name: guildName || 'Unknown' },
    select: { id: true },
  });
  return guild.id;
}
