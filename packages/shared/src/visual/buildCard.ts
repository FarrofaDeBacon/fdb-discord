/**
 * buildCard — Helper visual reutilizável, Components V2, tipado.
 * REGRAS V2: MessageFlags.IsComponentsV2, sem content/embeds/poll/stickers,
 * limite 40 componentes e 4000 chars por mensagem.
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
  accentColor?: string; // fallback default se guild não customizou
  textFields?: string[];
  sections?: { title?: string; fields?: string[] }[];
  buttons?: { label: string; customId: string; style?: ButtonStyle; disabled?: boolean }[];
  thumbnailUrl?: string;
  footer?: string;
}

export function buildCard(options: CardOptions) {
  const accent = options.accentColor || '#5865F2';

  const components = [];

  // Header Section
  const header = new SectionBuilder()
    .addTextDisplayBuilder(new TextDisplayBuilder().setContent(`**${options.title}**`));
  if (options.footer) {
    header.addTextDisplayBuilder(new TextDisplayBuilder().setContent(options.footer));
  }
  components.push(header);

  // Text fields
  for (const text of options.textFields || []) {
    components.push(new SectionBuilder().addTextDisplayBuilder(new TextDisplayBuilder().setContent(text)));
  }

  // Sections (grid-like)
  for (const sec of options.sections || []) {
    const s = new SectionBuilder();
    if (sec.title) s.addTextDisplayBuilder(new TextDisplayBuilder().setContent(sec.title));
    for (const f of sec.fields || []) s.addTextDisplayBuilder(new TextDisplayBuilder().setContent(f));
    components.push(s);
  }

  // Thumbnail
  if (options.thumbnailUrl) {
    components.push(new ThumbnailBuilder().setURL(options.thumbnailUrl));
  }

  // Separators entre seções (opcional)
  components.push(new SeparatorBuilder());

  // Botões interativos
  const buttonRow = new ActionRowBuilder();
  const btns = (options.buttons || []).slice(0, 5); // limite prático por row
  for (const b of btns) {
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId(b.customId)
        .setLabel(b.label)
        .setStyle(b.style || ButtonStyle.Primary)
        .setDisabled(b.disabled || false)
    );
  }
  if (btns.length > 0) components.push(buttonRow);

  // Container V2
  const container = new ContainerBuilder();
  for (const c of components) container.addComponent(c);

  return { container, flags: MessageFlags.IsComponentsV2, accentColor: accent };
}
