const { getUser } = require("@schemas/User");

/**
 * Verifica se o usuário tem premium ativo
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>}
 */
async function checkPremium(userId) {
  try {
    const userDb = await getUser({ id: userId });
    
    if (!userDb.isPremium || !userDb.premiumUntil) {
      return false;
    }
    
    // Verifica se o premium ainda está válido
    if (new Date() > userDb.premiumUntil) {
      userDb.isPremium = false;
      userDb.premiumUntil = null;
      await userDb.save();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar premium:", error);
    return false;
  }
}

module.exports = { checkPremium };