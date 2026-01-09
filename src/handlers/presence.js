const { ActivityType } = require("discord.js");

class PresenceManager {
  constructor(client) {
    this.client = client;
    this.messageIndex = 0;
    this.interval = null;
    this.updateInterval = 5000; // 5 segundos padrão
    this.typewriterInterval = null;
    this.typewriterIndex = 0;
    this.isTypewriting = false;
  }

  start() {
    const config = this.client.config.PRESENCE;
    
    if (config.FAST_ROTATION?.enabled) {
      this.setFastRotation(config.FAST_ROTATION.interval);
    } else if (config.TYPEWRITER?.enabled) {
      this.startTypewriter();
    } else {
      this.updatePresence();
      this.interval = setInterval(() => this.updatePresence(), this.updateInterval);
    }
  }

  startTypewriter() {
    const config = this.client.config.PRESENCE;
    const message = this.getCurrentMessage(config.MESSAGE);
    const processedMessage = this.processPlaceholders(message);
    const speed = config.TYPEWRITER?.speed || 200;
    
    this.isTypewriting = true;
    this.typewriterIndex = 0;
    
    this.typewriterInterval = setInterval(() => {
      if (this.typewriterIndex <= processedMessage.length) {
        const partialMessage = processedMessage.substring(0, this.typewriterIndex);
        this.setActivity(partialMessage + (this.typewriterIndex < processedMessage.length ? "_" : ""), config);
        this.typewriterIndex++;
      } else {
        // Mensagem completa, aguarda e rotaciona
        setTimeout(() => {
          this.rotateMessage(config.MESSAGE);
          this.typewriterIndex = 0;
        }, config.TYPEWRITER?.pause || 3000);
      }
    }, speed);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
      this.typewriterInterval = null;
    }
  }

  updatePresence() {
    try {
      const config = this.client.config.PRESENCE;
      if (!config?.MESSAGE) return;

      const message = this.getCurrentMessage(config.MESSAGE);
      const processedMessage = this.processPlaceholders(message);
      
      this.setActivity(processedMessage, config);
      this.rotateMessage(config.MESSAGE);
    } catch (error) {
      this.client.logger?.error("PresenceManager", error);
    }
  }

  getCurrentMessage(messages) {
    return Array.isArray(messages) ? messages[this.messageIndex] : messages;
  }

  processPlaceholders(message) {
    const stats = this.getStats();
    return message.replace(/\{(\w+)\}/g, (match, key) => stats[key] ?? match);
  }

  getStats() {
    const client = this.client;
    return {
      servers: client.guilds.cache.size,
      members: client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0),
      users: client.users.cache.size,
      channels: client.channels.cache.size,
      commands: client.commands?.size || client.slashCommands?.size || 0,
      ping: Math.round(client.ws.ping),
      uptime: this.formatUptime(client.uptime),
      shards: client.shard?.count || 1,
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      version: require("../../../package.json").version || "1.0.0"
    };
  }

  setActivity(message, config) {
    const activity = {
      name: message,
      type: this.getActivityType(config.TYPE),
    };

    if (config.TYPE === "CUSTOM") activity.state = message;
    if (config.TYPE === "STREAMING" && config.URL) activity.url = config.URL;

    this.client.user.setPresence({
      status: config.STATUS || "online",
      activities: [activity],
    });
  }

  getActivityType(type) {
    const types = {
      COMPETING: ActivityType.Competing,
      LISTENING: ActivityType.Listening,
      PLAYING: ActivityType.Playing,
      WATCHING: ActivityType.Watching,
      CUSTOM: ActivityType.Custom,
      STREAMING: ActivityType.Streaming
    };
    return types[type] || ActivityType.Playing;
  }

  rotateMessage(messages) {
    if (Array.isArray(messages)) {
      this.messageIndex = (this.messageIndex + 1) % messages.length;
    }
  }

  formatUptime(uptime) {
    if (!uptime) return "0m";
    
    const seconds = Math.floor(uptime / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  setUpdateInterval(ms) {
    this.updateInterval = ms;
    if (this.interval) {
      this.stop();
      this.start();
    }
  }

  enableTypewriter(speed = 200, pause = 3000) {
    this.client.config.PRESENCE.TYPEWRITER = {
      enabled: true,
      speed,
      pause
    };
    this.stop();
    this.start();
  }

  disableTypewriter() {
    this.client.config.PRESENCE.TYPEWRITER = { enabled: false };
    this.stop();
    this.start();
  }

  setFastRotation(intervalMs = 1000) {
    this.client.config.PRESENCE.FAST_ROTATION = {
      enabled: true,
      interval: intervalMs
    };
    
    this.stop();
    this.updateInterval = intervalMs;
    this.updatePresence();
    this.interval = setInterval(() => {
      this.updatePresence();
      this.rotateMessage(this.client.config.PRESENCE.MESSAGE);
    }, intervalMs);
  }
}

module.exports = function handlePresence(client) {
  const presenceManager = new PresenceManager(client);
  client.presenceManager = presenceManager;
  presenceManager.start();
  
  // Graceful shutdown
  process.on("SIGINT", () => presenceManager.stop());
  process.on("SIGTERM", () => presenceManager.stop());
};
