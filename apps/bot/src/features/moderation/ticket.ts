import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ChannelType } from 'discord.js';
import { buildCard } from '@fdb-discord/shared';
import { resolveGuildUuid } from '@fdb-discord/shared';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ticketCommand = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Abrir ticket de suporte')
    .addStringOption(o => o.setName('motivo').setDescription('Motivo do atendimento').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId!;
    const guildUuid = await resolveGuildUuid(prisma, guildId, interaction.guild?.name);
    const motivo = interaction.options.getString('motivo', true);

    // Buscar config de ticket para essa guild
    const config = await prisma.ticketConfig.findUnique({
      where: { guild_id: guildUuid },
    });

    const categoryId = config?.category_id || null;
    const channel = await interaction.guild?.channels.create({
      name: `ticket-${interaction.user.id}`,
      type: ChannelType.GuildText,
      ...(categoryId ? { parent: categoryId } : {}),
      permissionOverwrites: [
        { id: interaction.guild?.id || '', allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      ],
    });

    await prisma.ticket.create({
      data: {
        guild_id: guildUuid,
        channel_id: channel?.id || '',
        opened_by: interaction.user.id,
        status: 'open',
      },
    });

    const { container, flags } = buildCard({
      title: `🎫 Ticket aberto — ${interaction.user.tag}`,
      accentColor: 0x5865F2,
      textFields: [`Motivo: ${motivo}`, `Canal: ${channel?.name}`],
      buttons: [{ label: 'Fechar', customId: 'ticket_close' }],
    });

    await interaction.reply({ flags, components: [container] });
  },
};
