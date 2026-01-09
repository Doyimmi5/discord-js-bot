const { ApplicationCommandOptionType, ActivityType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "setstatus",
  description: "alterar status do bot",
  category: "OWNER",
  command: {
    enabled: true,
    usage: "<tipo> <texto>",
    minArgsCount: 2,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "tipo",
        description: "tipo de atividade",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: "Playing", value: "PLAYING" },
          { name: "Listening", value: "LISTENING" },
          { name: "Watching", value: "WATCHING" },
          { name: "Competing", value: "COMPETING" },
        ],
      },
      {
        name: "texto",
        description: "texto do status",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const tipo = args[0].toUpperCase();
    const texto = args.slice(1).join(" ");
    const response = await setStatus(message.client, tipo, texto);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const tipo = interaction.options.getString("tipo");
    const texto = interaction.options.getString("texto");
    const response = await setStatus(interaction.client, tipo, texto);
    await interaction.followUp(response);
  },
};

async function setStatus(client, tipo, texto) {
  const activityTypes = {
    PLAYING: ActivityType.Playing,
    LISTENING: ActivityType.Listening,
    WATCHING: ActivityType.Watching,
    COMPETING: ActivityType.Competing,
  };

  if (!activityTypes[tipo]) {
    return "❌ Tipo inválido. Use: PLAYING, LISTENING, WATCHING, COMPETING";
  }

  try {
    client.user.setActivity(texto, { type: activityTypes[tipo] });
    return `✅ Status alterado para: **${tipo.toLowerCase()}** ${texto}`;
  } catch (error) {
    return "❌ Erro ao alterar status.";
  }
}