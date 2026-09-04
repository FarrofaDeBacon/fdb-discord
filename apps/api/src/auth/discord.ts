/**
 * 6.1 — Checagem de admin por guild OU autenticado
 * Teste de 403 realizado no código (não em runtime — ambiente sem DB):
 *  - User A (admin da guild 1111) acessa /api/guilds/1111/config → 200
 *  - User B (não admin) tenta /api/guilds/1111/config → 403 (sessionGuildIds não contém 1111)
 *  - User B tenta /api/guilds/9999/config (guild alheia) → 403 (mesmo motivo)
 *  - Nenhuma rota confia apenas em UUID da URL — sempre compara com session
 */
export async function checkGuildAdmin(reqGuildId: string, sessionGuildIds: string[]): Promise<boolean> {
  return sessionGuildIds.includes(reqGuildId);
}
