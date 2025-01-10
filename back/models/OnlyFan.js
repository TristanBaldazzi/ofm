const mongoose = require('mongoose');

const onlyFanSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nom de l'OnlyFan
  socialMedia: { type: [String], default: [] }, // Réseaux sociaux (facultatif)
  description: { type: String }, // Description (facultatif)
  photo: { 
    type: String, 
    default: 'default-photo.jpg' // Photo par défaut si aucune n'est fournie
  },
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true // Lien obligatoire avec une entreprise
  },
  createdAt: { type: Date, default: Date.now } // Date de création
});

module.exports = mongoose.model('OnlyFan', onlyFanSchema);
