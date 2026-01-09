const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  guild_id: { type: String, required: true },
  user_id: { type: String, required: true },
  message_count: { type: Number, default: 0 },
  last_message: { type: Date, default: Date.now },
  month: { type: String, required: true }, // formato: "2024-01"
});

Schema.index({ guild_id: 1, user_id: 1, month: 1 }, { unique: true });

const Model = mongoose.model("movchat", Schema);

module.exports = {
  Model,
  
  async addMessage(guildId, userId) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    await Model.findOneAndUpdate(
      { guild_id: guildId, user_id: userId, month: currentMonth },
      { 
        $inc: { message_count: 1 },
        $set: { last_message: new Date() }
      },
      { upsert: true }
    );
  },

  async getMonthlyRanking(guildId, month = null) {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    
    return await Model.find({ guild_id: guildId, month: targetMonth })
      .sort({ message_count: -1 })
      .limit(10);
  },

  async resetMonth(guildId, month = null) {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    
    return await Model.deleteMany({ guild_id: guildId, month: targetMonth });
  }
};