// models/Log.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["INFO", "ERROR", "WARNING", "SUCCESS"], // Types de logs
      required: true,
    },
    category: {
      type: String,
      enum: ["Entreprise", "User", "Tickets", "Admin"], // Catégories possibles
      required: true,
    },
    date: {
      type: Date,
      default: Date.now, // Date de l'action
    },
    actorType: {
      type: String,
      enum: ["Admin", "User", "System"], // Qui a effectué l'action
      required: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId, // ID de l'utilisateur (si applicable)
      ref: "User",
      default: null,
    },
    message: {
      type: String, // Message décrivant l'action
      required: true,
    },
  },
  { timestamps: true } // Ajoute createdAt et updatedAt automatiquement
);

module.exports = mongoose.model("Log", logSchema);
