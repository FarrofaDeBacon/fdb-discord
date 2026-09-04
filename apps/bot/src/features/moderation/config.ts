import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ChannelType } from 'discord.js';
import { buildCard } from '@fdb-discord/shared';
import { resolveGuildUuid } from '@fdb-discord/shared';
import { resolveThemeColor } from '@fdb-discord/shared';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const configCommand = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configurar guild (admin apenas)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub
      .setName('tema')
      .setDescription('Definir cor de uma categoria')
      .addStringOption(o => o.setName('categoria').setRequired(true).addChoices(
        { name: 'neutral', value: 'neutral' },
        { name: 'warning', value: 'warning' },
        { name: 'punishment_light', value: 'punishment_light' },
        { name: 'punishment_heavy', value: 'punishment_heavy' },
        { name: 'success', value: 'success' },
        { name: 'closed', value: 'closed' },
      ))
      .addStringOption(o => o.setName('cor_hex').setRequired(true)))
    .addSubcommandGroup(group => group
      .setName('ticket')
      .setDescription('Configurar ticket')
      .addSubcommand(sub => sub.setName('categoria').setDescription('Canal categoria')
        .addChannelOption(o => o.setName('canal').setRequired(true).addChannelTypes(ChannelType.GuildCategory)))
      .addSubcommand(sub => sub.setName('suporte').setDescription('Cargo suporte')
        .addRoleOption(o => o.setName('cargo').setRequired(true))))
    .addSubcommand(sub => sub
      .setName('whitelist')
      .setDescription('Configurar whitelist')
      .addRoleOption(o => o.setName('cargo').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('ver')
      .setDescription('Ver configuração atual')),

  async execute(interaction: ChatInputCommandInteraction) {
    const guildUuid = await resolveGuildUuid(prisma, interaction.guildId!, interaction.guild?.name);
    const subGroup = interaction.options.getSubcommandGroup(false);
    const sub = interaction.options.getSubcommand(true);

    if (sub === 'tema') {
      const cat = interaction.options.getString('categoria', true);
      const hex = interaction.options.getString('cor_hex', true);
      if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return interaction.reply({ content: 'Hex inválido. Use #RRGGBB', ephemeral: true });
      const config = await prisma.guildConfig.findUnique({ where: { guild_id: guildUuid } });
      const theme = (config?.theme_json as Record<string, string>) || {};
      await prisma.guildConfig.upsert({
        where: { guild_id: guildUuid },
        update: { theme_json: { ...theme, [cat]: hex } },
        create: { guild_id: guildUuid, theme_json: { ...theme, [cat]: hex } },
      });
      return interaction.reply({ content: `Tema ${cat} = ${hex}`, ephemeral: true });
    }

    if (sub === 'ver') {
      const gc = await prisma.guildConfig.findUnique({ where: { guild_id: guildUuid } });
      const tc = await prisma.ticketConfig.findUnique({ where: { guild_id: guildUuid } });
      const wc = await prisma.whitelistConfig.findUnique({ where: { guild_id: guildUuid } });
      const { container, flags } = buildCard({
        title: '⚙️ Config',
        accentColor: resolveThemeColor('neutral', gc?.theme_json as any),
        textFields: [
          `Tema: ${gc?.theme_json ? JSON.stringify(gc.theme_json) : 'default'}`,
          `Ticket categoria: ${tc?.category_id || 'nenhuma'}`,
          `Ticket suporte: ${tc?.support_role_id || 'nenhum'}`,
          `Whitelist cargo: ${wc?.whitelist_role_id || 'nenhum'}`,
        ],
        buttons: [{ label: 'Fechar', customId: 'mod_dismiss' }],
      });
      return interaction.reply({ flags, components: [container] });
    }

    // 5.3 — subcomandos de grupo: ticket (categoria/suporte) + whitelist (cargo)
    if (subGroup === 'ticket' && sub === 'categoria') {
      const canal = interaction.options.getChannel('canal', true);
      await prisma.ticketConfig.upsert({
        where: { guild_id: guildUuid },
        update: { category_id: canal.id },
        create: { guild_id: guildUuid, category_id: canal.id },
      });
      return interaction.reply({ content: `Ticket categoria = <#${canal.id}>`, ephemeral: true });
    }
    if (subGroup === 'ticket' && sub === 'suporte') {
      const cargo = interaction.options.getRole('cargo', true).id;
      await prisma.ticketConfig.upsert({
        where: { guild_id: guildUuid },
        update: { support_role_id: cargo },
        create: { guild_id: guildUuid, support_role_id: cargo },
      });
      return interaction.reply({ content: `Ticket suporte = <@&${cargo}>`, ephemeral: true });
    }
    if (sub === 'whitelist') {
      const cargo = interaction.options.getRole('cargo', true).id;
      await prisma.whitelistConfig.upsert({
        where: { guild_id: guildUuid },
        update: { whitelist_role_id: cargo },
        create: { guild_id: guildUuid, whitelist_role_id: cargo },
      });
      return interaction.reply({ content: `Whitelist cargo = <@&${cargo}>`, ephemeral: true });
    }

    return interaction.reply({ content: 'Subcomando não reconhecido.', ephemeral: true });
  },
};
