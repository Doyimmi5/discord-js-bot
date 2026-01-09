const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { getJson } = require("@helpers/HttpUtils");

module.exports = {
  name: "joke",
  description: "Receba piadas premium de alta qualidade",
  category: "PREMIUM",
  isPremium: true,
  cooldown: 3,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message) {
    const embed = await getJokeEmbed();
    message.safeReply({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const embed = await getJokeEmbed();
    interaction.followUp({ embeds: [embed] });
  },
};

async function getJokeEmbed() {
  try {
    const response = await getJson("https://official-joke-api.appspot.com/random_joke");
    
    if (!response.success || !response.data) {
      return new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setDescription("❌ Não foi possível buscar uma piada!");
    }

    const { setup, punchline } = response.data;

    return new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("😂 Piada Premium")
      .setDescription(`**${setup}**\n\n||${punchline}||`)
      .setFooter({ text: "Premium Feature • Clique na resposta para revelar" })
      .setTimestamp();
  } catch (error) {
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("❌ Erro ao buscar piada!");
  }
}