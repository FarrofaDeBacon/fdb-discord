/**
 * Cache de config por guild com node-cache.
 * Regra arquitetural: isolamento por guild é lei.
 * Nunca ler/escrever config sem guild_id.
 */
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export function getGuildConfigKey(guildId: string): string {
  return `guild:${guildId}:config`;
}

export function setGuildConfig(guildId: string, config: Record<string, unknown>) {
  cache.set(getGuildConfigKey(guildId), config);
}

export function getGuildConfig(guildId: string): Record<string, unknown> | undefined {
  return cache.get(getGuildConfigKey(guildId)) as Record<string, unknown> | undefined;
}

export function invalidateGuildConfig(guildId: string) {
  cache.del(getGuildConfigKey(guildId));
}
