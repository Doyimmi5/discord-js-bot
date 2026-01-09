const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const PremiumKey = require("@schemas/PremiumKey");
const { EMBED_COLORS } = require("@root/config");

function generateKey() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

module.exports = {
  name: "generatekey",
  description: "Gera uma chave premium",
  category: "OWNER",
  cooldown: 5,
  command: {
    enabled: true,
    usage: "<dias>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "dias",
        description: "Duração do premium em dias",
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 1,
        max_value: 365,
      },
    ],
  },

  async messageRun(message, args) {
    const days = parseInt(args[0]);
    if (isNaN(days) || days < 1 || days > 365) {
      return message.safeReply("❌ Especifique um número válido de dias (1-365)");
    }

    const key = generateKey();
    
    try {
      await PremiumKey.create({
        key,
        createdBy: message.author.id,
        duration: days,
      });

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.SUCCESS)
        .setTitle("🔑 Chave Premium Gerada")
        .addFields(
          { name: "Chave", value: `\`${key}\``, inline: false },
          { name: "Duração", value: `${days} dias`, inline: true },
          { name: "Criada por", value: `<@${message.author.id}>`, inline: true }
        )
        .setTimestamp();

      message.safeReply({ embeds: [embed] });
    } catch (error) {
      message.safeReply("❌ Erro ao gerar chave premium");
    }
  },

  async interactionRun(interaction) {
    const days = interaction.options.getInteger("dias");
    const key = generateKey();
    
    try {
      await PremiumKey.create({
        key,
        createdBy: interaction.user.id,
        duration: days,
      });

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.SUCCESS)
        .setTitle("🔑 Chave Premium Gerada")
        .addFields(
          { name: "Chave", value: `\`${key}\``, inline: false },
          { name: "Duração", value: `${days} dias`, inline: true },
          { name: "Criada por", value: `<@${interaction.user.id}>`, inline: true }
        )
        .setTimestamp();

      interaction.followUp({ embeds: [embed] });
    } catch (error) {
      interaction.followUp("❌ Erro ao gerar chave premium");
    }
  },
};