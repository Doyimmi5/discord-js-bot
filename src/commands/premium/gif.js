const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "gif",
  description: "buscar GIFs do Tenor",
  cooldown: 3,
  category: "PREMIUM",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<termo>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "termo",
        description: "termo para buscar GIF",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const termo = args.join(" ");
    const response = await searchGif(termo);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const termo = interaction.options.getString("termo");
    const response = await searchGif(termo);
    await interaction.followUp(response);
  },
};

async function searchGif(termo) {
  const response = await getJson(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(termo)}&key=${process.env.TENOR_API_KEY}&limit=10`);
  
  if (!response.success || !response.data.results?.length) {
    return "❌ Nenhum GIF encontrado para este termo.";
  }

  const gifs = response.data.results;
  const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

  const embed = new EmbedBuilder()
    .setTitle(`🎬 GIF: ${termo}`)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setImage(randomGif.media_formats.gif.url)
    .setFooter({ text: `Powered by Tenor • ${gifs.length} resultados` });

  return { embeds: [embed] };
}