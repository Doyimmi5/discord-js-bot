const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

const responses = [
  "🔮 Sim, definitivamente!",
  "🔮 É certo que sim!",
  "🔮 Sem dúvida alguma!",
  "🔮 Sim - definitivamente!",
  "🔮 Você pode contar com isso!",
  "🔮 Como eu vejo, sim!",
  "🔮 Muito provavelmente!",
  "🔮 As perspectivas são boas!",
  "🔮 Sim!",
  "🔮 Os sinais apontam para sim!",
  "🔮 Resposta nebulosa, tente novamente!",
  "🔮 Pergunte novamente mais tarde!",
  "🔮 Melhor não te dizer agora!",
  "🔮 Não posso prever agora!",
  "🔮 Concentre-se e pergunte novamente!",
  "🔮 Não conte com isso!",
  "🔮 Minha resposta é não!",
  "🔮 Minhas fontes dizem que não!",
  "🔮 As perspectivas não são tão boas!",
  "🔮 Muito duvidoso!"
];

module.exports = {
  name: "8ball",
  description: "Faça uma pergunta à bola mágica premium",
  category: "PREMIUM",
  isPremium: true,
  cooldown: 5,
  command: {
    enabled: true,
    usage: "<pergunta>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "pergunta",
        description: "Sua pergunta para a bola mágica",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const question = args.join(" ");
    const response = responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("🎱 Bola Mágica Premium")
      .addFields(
        { name: "❓ Pergunta", value: question, inline: false },
        { name: "🔮 Resposta", value: response, inline: false }
      )
      .setFooter({ text: "Premium Feature" })
      .setTimestamp();

    message.safeReply({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const question = interaction.options.getString("pergunta");
    const response = responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("🎱 Bola Mágica Premium")
      .addFields(
        { name: "❓ Pergunta", value: question, inline: false },
        { name: "🔮 Resposta", value: response, inline: false }
      )
      .setFooter({ text: "Premium Feature" })
      .setTimestamp();

    interaction.followUp({ embeds: [embed] });
  },
};