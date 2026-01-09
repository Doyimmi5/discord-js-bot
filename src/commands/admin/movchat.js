const { ApplicationCommandOptionType, EmbedBuilder, ChannelType } = require("discord.js");
const { getMonthlyRanking, resetMonth } = require("@schemas/MovChat");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "movchat",
  description: "Sistema de contabilização de mensagens para staff",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "setup",
        description: "Configurar canais e cargos do MovChat",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "canais",
            description: "Canais para monitorar (separados por espaço)",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "cargos",
            description: "Cargos de staff (separados por espaço)",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "rank",
        description: "Mostrar ranking de mensagens",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "mes",
            description: "Mês específico (formato: 2024-01)",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "reset",
        description: "Resetar contagem de mensagens",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "mes",
            description: "Mês para resetar (formato: 2024-01)",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction, data) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "setup":
        return await setupMovChat(interaction, data.settings);
      case "rank":
        return await showRanking(interaction);
      case "reset":
        return await resetMovChat(interaction);
    }
  },
};

async function setupMovChat(interaction, settings) {
  const canaisInput = interaction.options.getString("canais");
  const cargosInput = interaction.options.getString("cargos");

  const canais = canaisInput.match(/<#(\d+)>/g)?.map(c => c.match(/\d+/)[0]) || [];
  const cargos = cargosInput.match(/<@&(\d+)>/g)?.map(r => r.match(/\d+/)[0]) || [];

  if (canais.length === 0) {
    return interaction.followUp("❌ Nenhum canal válido encontrado. Use menções de canal (#canal)");
  }

  if (cargos.length === 0) {
    return interaction.followUp("❌ Nenhum cargo válido encontrado. Use menções de cargo (@cargo)");
  }

  settings.movchat = {
    enabled: true,
    channels: canais,
    staff_roles: cargos,
  };

  await settings.save();

  const embed = new EmbedBuilder()
    .setTitle("✅ MovChat Configurado")
    .setColor("Green")
    .addFields(
      { name: "Canais Monitorados", value: canais.map(c => `<#${c}>`).join(", "), inline: false },
      { name: "Cargos de Staff", value: cargos.map(r => `<@&${r}>`).join(", "), inline: false }
    );

  return interaction.followUp({ embeds: [embed] });
}

async function showRanking(interaction) {
  const mes = interaction.options.getString("mes");
  const ranking = await getMonthlyRanking(interaction.guildId, mes);

  if (ranking.length === 0) {
    return interaction.followUp("📊 Nenhuma mensagem registrada para este período.");
  }

  const targetMonth = mes || new Date().toISOString().slice(0, 7);
  const embed = new EmbedBuilder()
    .setTitle(`📊 Ranking MovChat - ${targetMonth}`)
    .setColor("Blue");

  let description = "";
  for (let i = 0; i < ranking.length; i++) {
    const user = ranking[i];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`;
    description += `${medal} <@${user.user_id}> - **${user.message_count}** mensagens\n`;
  }

  embed.setDescription(description);
  return interaction.followUp({ embeds: [embed] });
}

async function resetMovChat(interaction) {
  const mes = interaction.options.getString("mes");
  const result = await resetMonth(interaction.guildId, mes);
  
  const targetMonth = mes || new Date().toISOString().slice(0, 7);
  
  return interaction.followUp(`✅ Reset realizado para ${targetMonth}. ${result.deletedCount} registros removidos.`);
}