const { Schema, model } = require("mongoose");

const premiumKeySchema = new Schema({
  key: { type: String, required: true, unique: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  redeemedBy: { type: String, default: null },
  redeemedAt: { type: Date, default: null },
  isUsed: { type: Boolean, default: false },
  duration: { type: Number, required: true }, // em dias
});

module.exports = model("PremiumKey", premiumKeySchema);