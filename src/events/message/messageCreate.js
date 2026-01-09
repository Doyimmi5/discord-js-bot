const { commandHandler, automodHandler, statsHandler } = require("@src/handlers");
const { PREFIX_COMMANDS } = require("@root/config");
const { getSettings } = require("@schemas/Guild");
const { addMessage } = require("@schemas/MovChat");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message} message
 */
module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;
  const settings = await getSettings(message.guild);

  // command handler
  let isCommand = false;
  if (PREFIX_COMMANDS.ENABLED) {
    // check for bot mentions
    if (message.content.includes(`${client.user.id}`)) {
      message.channel.safeSend(`> My prefix is \`${settings.prefix}\``);
    }

    if (message.content && message.content.startsWith(settings.prefix)) {
      const invoke = message.content.replace(`${settings.prefix}`, "").split(/\s+/)[0];
      const cmd = client.getCommand(invoke);
      if (cmd) {
        isCommand = true;
        commandHandler.handlePrefixCommand(message, cmd, settings);
      }
    }
  }

  // stats handler
  if (settings.stats.enabled) await statsHandler.trackMessageStats(message, isCommand, settings);

  // movchat handler
  if (settings.movchat?.enabled && !isCommand) {
    const isStaff = message.member.roles.cache.some(role => settings.movchat.staff_roles.includes(role.id));
    const isMonitoredChannel = settings.movchat.channels.includes(message.channel.id);
    
    if (isStaff && isMonitoredChannel) {
      await addMessage(message.guild.id, message.author.id);
    }
  }

  // if not a command
  if (!isCommand) await automodHandler.performAutomod(message, settings);
};
