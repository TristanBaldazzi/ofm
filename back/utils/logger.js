// utils/logger.js
const Log = require("../models/Log");

/**
 * Enregistre un log dans la base de données.
 * @param {String} type - Type du log (INFO, ERROR, WARNING, SUCCESS).
 * @param {String} category - Catégorie du log (Entreprise, User, Tickets, Admin).
 * @param {String} actorType - Qui a effectué l'action (Admin, User, System).
 * @param {String} message - Message décrivant l'action.
 * @param {String|null} actorId - ID de l'acteur (si applicable).
 */

const createLog = async (type, category, actorType, message, actorId = null) => {
  try {
    const log = new Log({
      type,
      category,
      actorType,
      message,
      actorId,
    });
    await log.save();
    console.log(`[LOG] ${type} [${category}] : ${message}`);
  } catch (error) {
    console.error(`[LOG ERROR] Impossible d'enregistrer le log :`, error);
  }
};

module.exports = createLog;
