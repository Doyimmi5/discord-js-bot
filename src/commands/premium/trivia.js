const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { getJson } = require("@helpers/HttpUtils");

const categories = {
  "geral": 9,
  "entretenimento": 11,
  "ciencia": 17,
  "historia": 23,
  "esportes": 21,
  "geografia": 22
};

module.exports = {
  name: "trivia",
  description: "Jogue trivia premium com múltiplas categorias",
  category: "PREMIUM",
  isPremium: true,
  cooldown: 8,
  command: {
    enabled: true,
    usage: "[categoria]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "categoria",
        description: "Categoria da pergunta",
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [
          { name: "Geral", value: "geral" },
          { name: "Entretenimento", value: "entretenimento" },
          { name: "Ciência", value: "ciencia" },
          { name: "História", value: "historia" },
          { name: "Esportes", value: "esportes" },
          { name: "Geografia", value: "geografia" }
        ]
      }
    ]
  },

  async messageRun(message, args) {
    const category = args[0] || "geral";
    await handleTrivia(message, category, false);
  },

  async interactionRun(interaction) {
    const category = interaction.options.getString("categoria") || "geral";
    await handleTrivia(interaction, category, true);
  },
};

async function handleTrivia(context, category, isInteraction) {
  const categoryId = categories[category] || 9;
  
  try {
    const response = await getJson(`https://opentdb.com/api.php?amount=1&category=${categoryId}&type=multiple`);
    
    if (!response.success || !response.data?.results?.[0]) {
      const errorEmbed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setDescription("❌ Não foi possível buscar uma pergunta!");
      
      return isInteraction ? context.followUp({ embeds: [errorEmbed] }) : context.safeReply({ embeds: [errorEmbed] });
    }

    const question = response.data.results[0];
    const correctAnswer = decodeHtml(question.correct_answer);
    const incorrectAnswers = question.incorrect_answers.map(decodeHtml);
    
    // Mistura as respostas
    const allAnswers = [...incorrectAnswers, correctAnswer].sort(() => Math.random() - 0.5);
    const correctIndex = allAnswers.indexOf(correctAnswer);

    const buttons = new ActionRowBuilder().addComponents(
      allAnswers.map((answer, index) => 
        new ButtonBuilder()
          .setCustomId(`answer_${index}`)
          .setLabel(answer.substring(0, 80))
          .setStyle(ButtonStyle.Secondary)
      )
    );

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("🧠 Trivia Premium")
      .setDescription(`**${decodeHtml(question.question)}**`)
      .addFields(
        { name: "Categoria", value: decodeHtml(question.category), inline: true },
        { name: "Dificuldade", value: question.difficulty.toUpperCase(), inline: true }
      )
      .setFooter({ text: "Premium Feature • Você tem 30 segundos!" })
      .setTimestamp();

    const msg = isInteraction ? 
      await context.followUp({ embeds: [embed], components: [buttons] }) :
      await context.safeReply({ embeds: [embed], components: [buttons] });

    const userId = isInteraction ? context.user.id : context.author.id;
    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === userId,
      time: 30000,
      max: 1
    });

    collector.on("collect", async (interaction) => {
      const selectedIndex = parseInt(interaction.customId.split("_")[1]);
      const isCorrect = selectedIndex === correctIndex;

      const resultEmbed = new EmbedBuilder()
        .setColor(isCorrect ? EMBED_COLORS.SUCCESS : EMBED_COLORS.ERROR)
        .setTitle(`🧠 Trivia Premium - ${isCorrect ? "Correto!" : "Incorreto!"}`)
        .setDescription(`**${decodeHtml(question.question)}**`)
        .addFields(
          { name: "✅ Resposta Correta", value: correctAnswer, inline: false },
          { name: "📊 Sua Resposta", value: allAnswers[selectedIndex], inline: false }
        )
        .setFooter({ text: "Premium Feature" })
        .setTimestamp();

      await interaction.update({ embeds: [resultEmbed], components: [] });
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setTitle("🧠 Trivia Premium - Tempo Esgotado!")
          .setDescription(`**${decodeHtml(question.question)}**`)
          .addFields({ name: "✅ Resposta Correta", value: correctAnswer, inline: false })
          .setFooter({ text: "Premium Feature" })
          .setTimestamp();

        msg.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });

  } catch (error) {
    const errorEmbed = new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("❌ Erro ao buscar pergunta!");
    
    return isInteraction ? context.followUp({ embeds: [errorEmbed] }) : context.safeReply({ embeds: [errorEmbed] });
  }
}

function decodeHtml(html) {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}