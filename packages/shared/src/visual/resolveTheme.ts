export type ThemeCategory = 'neutral' | 'warning' | 'punishment_light' | 'punishment_heavy' | 'success' | 'closed';

const DEFAULT_THEME: Record<ThemeCategory, number> = {
  neutral: 0x5865F2,
  warning: 0xFEE75C,
  punishment_light: 0xF1A93C,
  punishment_heavy: 0xED4245,
  success: 0x57F287,
  closed: 0x99AAB5,
};

export function resolveThemeColor(
  category: ThemeCategory,
  themeJson: Record<string, string> | null | undefined
): number {
  const override = themeJson?.[category];
  if (override) {
    return parseInt(override.replace('#', ''), 16);
  }
  return DEFAULT_THEME[category];
}
