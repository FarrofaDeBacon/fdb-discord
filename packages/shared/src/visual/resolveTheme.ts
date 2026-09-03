export function resolveThemeColor(type: 'ticket' | 'warn' | 'default' = 'default'): number {
  // Tema dinâmico — substitui hardcoded 0x5865F2 / 0xFFCC00
  const map = { ticket: 0x5865F2, warn: 0xFFCC00, default: 0x5865F2 };
  return map[type];
}
