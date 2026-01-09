const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getSettings } = require("@schemas/Guild");
const { EMBED_COLORS } = require("@root/config");
const ModUtils = require("@helpers/ModUtils");

module.exports = {
  name: "addstaff",
  description: "Adiciona um usuário ou cargo à equipe do servidor",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  cooldown: 5,
  command: {
    enabled: true,
    usage: "<@usuário|@cargo>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "usuário",
        description: "Usuário para adicionar à equipe",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
      {
        name: "cargo",
        description: "Cargo para adicionar à equipe",
        type: ApplicationCommandOptionType.Role,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const target = message.mentions.users.first() || message.mentions.roles.first() || 
                   message.guild.members.cache.get(args[0])?.user || 
                   message.guild.roles.cache.get(args[0]);
    
    if (!target) {
      return message.safeReply("❌ Mencione um usuário ou cargo válido!");
    }

    if (!ModUtils.canModerate(message.member, message.member)) {
      return message.safeReply("❌ Você não tem permissão para usar este comando!");
    }

    const response = await addStaff(message.guild, target);
    message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("usuário");
    const role = interaction.options.getRole("cargo");
    const target = user || role;
    
    if (!target) {
      return interaction.followUp("❌ Especifique um usuário ou cargo!");
    }

    if (!ModUtils.canModerate(interaction.member, interaction.member)) {
      return interaction.followUp("❌ Você não tem permissão para usar este comando!");
    }

    const response = await addStaff(interaction.guild, target);
    interaction.followUp(response);
  },
};

async function addStaff(guild, target) {
  try {
    const settings = await getSettings(guild);
    
    if (!settings.staff_members) {
      settings.staff_members = [];
    }
    
    const targetId = target.id;
    const isUser = target.username !== undefined;
    const targetName = isUser ? target.tag : target.name;
    const targetType = isUser ? "usuário" : "cargo";
    
    if (settings.staff_members.includes(targetId)) {
      return {
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLORS.ERROR)
            .setDescription(`❌ ${targetName} já é membro da equipe!`)
        ]
      };
    }
    
    settings.staff_members.push(targetId);
    await settings.save();
    
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.SUCCESS)
          .setTitle("✅ Staff Adicionado")
          .setDescription(`${targetName} (${targetType}) foi adicionado à equipe do servidor!`)
          .setThumbnail(isUser ? target.displayAvatarURL() : guild.iconURL())
          .setTimestamp()
      ]
    };
  } catch (error) {
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription("❌ Erro ao adicionar staff!")
      ]
    };
  }
}