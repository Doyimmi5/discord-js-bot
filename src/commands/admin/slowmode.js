const { EmbedBuilder, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = {
  name: "slowmode",
  description: "Define o modo lento em um canal",
  category: "ADMIN",
  userPermissions: ["ManageChannels"],
  botPermissions: ["ManageChannels"],
  cooldown: 3,
  command: {
    enabled: true,
    usage: "<segundos> [canal]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "segundos",
        description: "Tempo em segundos (0-21600, 0 para desativar)",
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 0,
        max_value: 21600,
      },
      {
        name: "canal",
        description: "Canal para aplicar slowmode",
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const seconds = parseInt(args[0]);
    const channel = message.mentions.channels.first() || message.channel;

    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      return message.safeReply("❌ Especifique um tempo válido entre 0 e 21600 segundos!");
    }

    const response = await setSlowmode(channel, seconds, message.member);
    message.safeReply(response);
  },

  async interactionRun(interaction) {
    const seconds = interaction.options.getInteger("segundos");
    const channel = interaction.options.getChannel("canal") || interaction.channel;

    const response = await setSlowmode(channel, seconds, interaction.member);
    interaction.followUp(response);
  },
};

async function setSlowmode(channel, seconds, member) {
  try {
    await channel.setRateLimitPerUser(seconds);

    if (seconds === 0) {
      return {
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLORS.SUCCESS)
            .setTitle("⚡ Slowmode Desativado")
            .setDescription(`${member} desativou o slowmode em ${channel}`)
            .setTimestamp()
        ]
      };
    }

    const timeFormat = formatTime(seconds);

    return {
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.WARNING)
          .setTitle("🐌 Slowmode Ativado")
          .setDescription(`${member} definiu slowmode de **${timeFormat}** em ${channel}`)
          .addFields(
            { name: "Tempo", value: `${seconds} segundos`, inline: true },
            { name: "Canal", value: channel.toString(), inline: true }
          )
          .setTimestamp()
      ]
    };
  } catch (error) {
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription("❌ Erro ao definir slowmode!")
      ]
    };
  }
}

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}