const { EmbedBuilder, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = {
  name: "lockdown",
  description: "Bloqueia ou desbloqueia um canal",
  category: "ADMIN",
  userPermissions: ["ManageChannels"],
  botPermissions: ["ManageChannels"],
  cooldown: 5,
  command: {
    enabled: true,
    usage: "[canal] [motivo]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "ação",
        description: "Bloquear ou desbloquear o canal",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: "Bloquear", value: "lock" },
          { name: "Desbloquear", value: "unlock" }
        ]
      },
      {
        name: "canal",
        description: "Canal para bloquear/desbloquear",
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
        required: false,
      },
      {
        name: "motivo",
        description: "Motivo do lockdown",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const channel = message.mentions.channels.first() || message.channel;
    const action = args[0]?.toLowerCase() === "unlock" ? "unlock" : "lock";
    const reason = args.slice(1).join(" ") || "Nenhum motivo fornecido";

    const response = await handleLockdown(channel, action, reason, message.member);
    message.safeReply(response);
  },

  async interactionRun(interaction) {
    const action = interaction.options.getString("ação");
    const channel = interaction.options.getChannel("canal") || interaction.channel;
    const reason = interaction.options.getString("motivo") || "Nenhum motivo fornecido";

    const response = await handleLockdown(channel, action, reason, interaction.member);
    interaction.followUp(response);
  },
};

async function handleLockdown(channel, action, reason, member) {
  try {
    const everyone = channel.guild.roles.everyone;
    const isLocked = !channel.permissionsFor(everyone).has("SendMessages");

    if (action === "lock") {
      if (isLocked) {
        return {
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLORS.ERROR)
              .setDescription(`❌ ${channel} já está bloqueado!`)
          ]
        };
      }

      await channel.permissionOverwrites.edit(everyone, {
        SendMessages: false,
        AddReactions: false,
      });

      return {
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLORS.WARNING)
            .setTitle("🔒 Canal Bloqueado")
            .setDescription(`${channel} foi bloqueado por ${member}`)
            .addFields({ name: "Motivo", value: reason, inline: false })
            .setTimestamp()
        ]
      };
    } else {
      if (!isLocked) {
        return {
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLORS.ERROR)
              .setDescription(`❌ ${channel} não está bloqueado!`)
          ]
        };
      }

      await channel.permissionOverwrites.edit(everyone, {
        SendMessages: null,
        AddReactions: null,
      });

      return {
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLORS.SUCCESS)
            .setTitle("🔓 Canal Desbloqueado")
            .setDescription(`${channel} foi desbloqueado por ${member}`)
            .addFields({ name: "Motivo", value: reason, inline: false })
            .setTimestamp()
        ]
      };
    }
  } catch (error) {
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription("❌ Erro ao executar lockdown!")
      ]
    };
  }
}