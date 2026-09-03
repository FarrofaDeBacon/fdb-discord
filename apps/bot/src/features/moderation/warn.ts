import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { buildCard } from '@fdb-discord/shared';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const warnCommand = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Aviso de moderação (guild isolado)')
    .addUserOption(o => o.setName('user').setDescription('Usuário').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Motivo').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId!; // isolamento: guild_id obrigatório
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'Sem motivo';

    // Escrever no banco — repository pattern forçaria filtro por guild_id
    await prisma.modLog.create({
      data: {
        guild_id: guildId, // NOTA: guarda UUID interno Guild.id; resolver antes
        type: 'warn',
        user_id: user.id,
        moderator_id: interaction.user.id,
        reason,
        timestamp: new Date(),
      },
    });

    // Visual V2 via buildCard (fundação auditada)
    const { container } = buildCard({
      title: `⚠️ Aviso — ${user.tag}`,
      accentColor: 0xFFCC00,
      textFields: [`Moderador: ${interaction.user.tag}`, `Motivo: ${reason}`],
      buttons: [{ label: 'Fechar', customId: 'warn_close' }],
    });

    await interaction.reply({ flags: 0, components: [container] } as any); // V2 via container
  },
};
