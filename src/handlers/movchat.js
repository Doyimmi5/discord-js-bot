const { Model } = require("@schemas/MovChat");
const { getSettings } = require("@schemas/Guild");

class MovChatScheduler {
  constructor(client) {
    this.client = client;
    this.lastResetCheck = new Date().toISOString().slice(0, 7);
    this.checkInterval = null;
  }

  start() {
    // Verifica a cada hora se mudou o mês
    this.checkInterval = setInterval(() => {
      this.checkMonthlyReset();
    }, 60 * 60 * 1000); // 1 hora

    // Verifica imediatamente ao iniciar
    this.checkMonthlyReset();
  }

  async checkMonthlyReset() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    if (currentMonth !== this.lastResetCheck) {
      console.log(`[MovChat] Iniciando reset automático para o mês: ${this.lastResetCheck}`);
      
      // Busca todos os guilds com MovChat habilitado
      const guilds = await this.client.guilds.cache.map(async guild => {
        try {
          const settings = await getSettings(guild);
          if (settings.movchat?.enabled) {
            return guild.id;
          }
        } catch (error) {
          console.error(`[MovChat] Erro ao verificar guild ${guild.id}:`, error);
        }
        return null;
      });

      const enabledGuilds = (await Promise.all(guilds)).filter(Boolean);
      
      // Reset para cada guild
      for (const guildId of enabledGuilds) {
        try {
          const result = await Model.deleteMany({ 
            guild_id: guildId, 
            month: this.lastResetCheck 
          });
          
          if (result.deletedCount > 0) {
            console.log(`[MovChat] Reset automático realizado para guild ${guildId}: ${result.deletedCount} registros removidos`);
          }
        } catch (error) {
          console.error(`[MovChat] Erro no reset automático para guild ${guildId}:`, error);
        }
      }

      this.lastResetCheck = currentMonth;
    }
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

module.exports = MovChatScheduler;