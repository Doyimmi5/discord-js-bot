const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "qrcode",
  description: "gerar QR code",
  cooldown: 3,
  category: "PREMIUM",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<texto>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "texto",
        description: "texto para gerar QR code",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const texto = args.join(" ");
    const response = await generateQR(texto);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const texto = interaction.options.getString("texto");
    const response = await generateQR(texto);
    await interaction.followUp(response);
  },
};

async function generateQR(texto) {
  if (texto.length > 500) {
    return "❌ Texto muito longo. Máximo 500 caracteres.";
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(texto)}`;

  const embed = new EmbedBuilder()
    .setTitle("📱 QR Code Gerado")
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setImage(qrUrl)
    .setDescription(`\`\`\`${texto.slice(0, 100)}${texto.length > 100 ? "..." : ""}\`\`\``);

  return { embeds: [embed] };
}