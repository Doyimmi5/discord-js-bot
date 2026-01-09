const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const PremiumKey = require("@schemas/PremiumKey");
const { getUser } = require("@schemas/User");
const { EMBED_COLORS } = require("@root/config");

module.exports = {
  name: "redeem",
  description: "Resgata uma chave premium",
  category: "UTILITY",
  cooldown: 10,
  command: {
    enabled: true,
    usage: "<chave>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "chave",
        description: "A chave premium para resgatar",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const key = args[0];
    
    try {
      const keyData = await PremiumKey.findOne({ key, isUsed: false });
      
      if (!keyData) {
        return message.safeReply("❌ Chave inválida ou já utilizada!");
      }

      const userDb = await getUser(message.author);
      
      // Calcula nova data de expiração
      const now = new Date();
      const currentExpiry = userDb.premiumUntil && userDb.premiumUntil > now ? userDb.premiumUntil : now;
      const newExpiry = new Date(currentExpiry.getTime() + (keyData.duration * 24 * 60 * 60 * 1000));
      
      // Atualiza usuário
      userDb.isPremium = true;
      userDb.premiumUntil = newExpiry;
      await userDb.save();
      
      // Marca chave como usada
      keyData.isUsed = true;
      keyData.redeemedBy = message.author.id;
      keyData.redeemedAt = now;
      await keyData.save();

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.SUCCESS)
        .setTitle("✅ Premium Ativado!")
        .setDescription(`Você agora tem acesso premium por **${keyData.duration} dias**!`)
        .addFields(
          { name: "Expira em", value: `<t:${Math.floor(newExpiry.getTime() / 1000)}:F>`, inline: false }
        )
        .setTimestamp();

      message.safeReply({ embeds: [embed] });
    } catch (error) {
      message.safeReply("❌ Erro ao resgatar chave premium");
    }
  },

  async interactionRun(interaction) {
    const key = interaction.options.getString("chave");
    
    try {
      const keyData = await PremiumKey.findOne({ key, isUsed: false });
      
      if (!keyData) {
        return interaction.followUp("❌ Chave inválida ou já utilizada!");
      }

      const userDb = await getUser(interaction.user);
      
      // Calcula nova data de expiração
      const now = new Date();
      const currentExpiry = userDb.premiumUntil && userDb.premiumUntil > now ? userDb.premiumUntil : now;
      const newExpiry = new Date(currentExpiry.getTime() + (keyData.duration * 24 * 60 * 60 * 1000));
      
      // Atualiza usuário
      userDb.isPremium = true;
      userDb.premiumUntil = newExpiry;
      await userDb.save();
      
      // Marca chave como usada
      keyData.isUsed = true;
      keyData.redeemedBy = interaction.user.id;
      keyData.redeemedAt = now;
      await keyData.save();

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.SUCCESS)
        .setTitle("✅ Premium Ativado!")
        .setDescription(`Você agora tem acesso premium por **${keyData.duration} dias**!`)
        .addFields(
          { name: "Expira em", value: `<t:${Math.floor(newExpiry.getTime() / 1000)}:F>`, inline: false }
        )
        .setTimestamp();

      interaction.followUp({ embeds: [embed] });
    } catch (error) {
      interaction.followUp("❌ Erro ao resgatar chave premium");
    }
  },
};