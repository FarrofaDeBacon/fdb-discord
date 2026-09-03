/**
 * buildCard — Helper visual reutilizável, Components V2 (discord.js v14.19+)
 * REGRAS V2: MessageFlags.IsComponentsV2, sem content/embeds/poll/stickers,
 * limite 40 componentes e 4000 chars por mensagem.
 * API REAL: ContainerBuilder.addTextDisplayComponents(), addSectionComponents(),
 * addSeparatorComponents(), addActionRowComponents(), addMediaGalleryComponents()
 * SectionBuilder.addTextDisplayComponents() — NÃO .addTextDisplayBuilder()
 * setAccentColor() aceita número (0x5865F2), não string hex
 */
import {
  ContainerBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
} from 'discord.js';

export interface CardOptions {
  title: string;
  accentColor?: number; // 0x5865F2 (número, NÃO string #...)
  textFields?: string[];
  sections?: { title?: string; fields?: string[] }[];
  buttons?: { label: string; customId: string; style?: ButtonStyle; disabled?: boolean }[];
  thumbnailUrl?: string;
  footer?: string;
}

export function buildCard(options: CardOptions) {
  const accent = options.accentColor || 0x5865F2;

  const container = new ContainerBuilder();
  container.setAccentColor(accent); // APARCIDO — barra colorida agora funciona

  // Header text
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**${options.title}**`)
  );

  if (options.footer) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(options.footer)
    );
  }

  // Text fields
  for (const text of options.textFields || []) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(text)
    );
  }

  // Sections (grid-like)
  for (const sec of options.sections || []) {
    const s = new SectionBuilder();
    s.setThumbnailAccessory(new ThumbnailBuilder().setURL('https://discord.com/assets/ff9fc8fdbcb55aefb6f5e36a6e7cf5e4c4d23f9c.png')); // accessory obrigatório per Discord API
    if (sec.title) s.addTextDisplayComponents(new TextDisplayBuilder().setContent(sec.title));
    for (const f of sec.fields || []) s.addTextDisplayComponents(new TextDisplayBuilder().setContent(f));
    container.addSectionComponents(s);
  }

  // Thumbnail
  if (options.thumbnailUrl) {
    container.addMediaGalleryComponents({
      items: [{ media: { url: options.thumbnailUrl } }],
    });
  }

  // Separator
  container.addSeparatorComponents(new SeparatorBuilder());

  // Botões interativos
  const btns = (options.buttons || []).slice(0, 5);
  if (btns.length > 0) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (const b of btns) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(b.customId)
          .setLabel(b.label)
          .setStyle(b.style || ButtonStyle.Primary)
          .setDisabled(b.disabled || false)
      );
    }
    container.addActionRowComponents(row);
  }

  // Limite: 40 componentes, 4000 chars — não verificado aqui (dever do caller)
  return { container, flags: MessageFlags.IsComponentsV2, accentColor: accent };
}
