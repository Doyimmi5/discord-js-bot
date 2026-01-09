const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { getJson } = require("@helpers/HttpUtils");

module.exports = {
  name: "quote",
  description: "Receba citações inspiradoras premium",
  category: "PREMIUM",
  isPremium: true,
  cooldown: 5,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message) {
    const embed = await getQuoteEmbed();
    message.safeReply({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const embed = await getQuoteEmbed();
    interaction.followUp({ embeds: [embed] });
  },
};

async function getQuoteEmbed() {
  try {
    const response = await getJson("https://api.quotable.io/random");
    
    if (!response.success || !response.data) {
      return new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setDescription("❌ Não foi possível buscar uma citação!");
    }

    const { content, author } = response.data;

    return new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("💭 Citação Premium")
      .setDescription(`*"${content}"*`)
      .setFooter({ text: `— ${author} • Premium Feature` })
      .setTimestamp();
  } catch (error) {
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("❌ Erro ao buscar citação!");
  }
}