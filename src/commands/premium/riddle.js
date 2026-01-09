const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

const riddles = [
  {
    question: "O que é que quanto mais se tira, maior fica?",
    answer: "Um buraco"
  },
  {
    question: "O que é que tem coroa mas não é rei, tem escama mas não é peixe?",
    answer: "Abacaxi"
  },
  {
    question: "O que é que nasce grande e morre pequeno?",
    answer: "Lápis"
  },
  {
    question: "O que é que tem dentes mas não morde?",
    answer: "Alho"
  },
  {
    question: "O que é que sobe quando a chuva desce?",
    answer: "Guarda-chuva"
  },
  {
    question: "O que é que tem cabeça e não pensa?",
    answer: "Alfinete"
  },
  {
    question: "O que é que quanto mais rugas tem, mais novo é?",
    answer: "Pneu"
  },
  {
    question: "O que é que tem boca mas não fala, tem leito mas não dorme?",
    answer: "Rio"
  }
];

module.exports = {
  name: "riddle",
  description: "Desafie-se com charadas premium",
  category: "PREMIUM",
  isPremium: true,
  cooldown: 10,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message) {
    const riddle = riddles[Math.floor(Math.random() * riddles.length)];
    
    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("reveal_answer")
        .setLabel("Revelar Resposta")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🤔")
    );

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("🧩 Charada Premium")
      .setDescription(riddle.question)
      .setFooter({ text: "Premium Feature • Clique no botão para ver a resposta" })
      .setTimestamp();

    const msg = await message.safeReply({ embeds: [embed], components: [button] });

    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 60000,
      max: 1
    });

    collector.on("collect", async (interaction) => {
      const answerEmbed = new EmbedBuilder()
        .setColor(EMBED_COLORS.SUCCESS)
        .setTitle("🧩 Charada Premium")
        .addFields(
          { name: "❓ Pergunta", value: riddle.question, inline: false },
          { name: "✅ Resposta", value: riddle.answer, inline: false }
        )
        .setFooter({ text: "Premium Feature" })
        .setTimestamp();

      await interaction.update({ embeds: [answerEmbed], components: [] });
    });

    collector.on("end", () => {
      button.components[0].setDisabled(true);
      msg.edit({ components: [button] });
    });
  },

  async interactionRun(interaction) {
    const riddle = riddles[Math.floor(Math.random() * riddles.length)];
    
    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("reveal_answer")
        .setLabel("Revelar Resposta")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🤔")
    );

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("🧩 Charada Premium")
      .setDescription(riddle.question)
      .setFooter({ text: "Premium Feature • Clique no botão para ver a resposta" })
      .setTimestamp();

    await interaction.followUp({ embeds: [embed], components: [button] });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 60000,
      max: 1
    });

    collector.on("collect", async (i) => {
      const answerEmbed = new EmbedBuilder()
        .setColor(EMBED_COLORS.SUCCESS)
        .setTitle("🧩 Charada Premium")
        .addFields(
          { name: "❓ Pergunta", value: riddle.question, inline: false },
          { name: "✅ Resposta", value: riddle.answer, inline: false }
        )
        .setFooter({ text: "Premium Feature" })
        .setTimestamp();

      await i.update({ embeds: [answerEmbed], components: [] });
    });
  },
};