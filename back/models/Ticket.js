const mongoose = require('mongoose');

// Schéma des messages
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Référence à l'utilisateur qui envoie le message
  text: String, // Contenu du message
  file: String, // Chemin ou nom du fichier joint (ajouté ici)
  timestamp: { type: Date, default: Date.now } // Date et heure d'envoi
});

// Schéma des tickets
const ticketSchema = new mongoose.Schema({
  title: String, // Titre du ticket
  description: String, // Description du problème ou de la demande
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Référence à l'utilisateur qui a créé le ticket
  status: { type: String, enum: ['open', 'closed'], default: 'open' }, // Statut du ticket (ouvert ou fermé)
  messages: [messageSchema], // Liste des messages associés au ticket
  created_at: { type: Date, default: Date.now } // Date de création du ticket
});

module.exports = mongoose.model('Ticket', ticketSchema);
