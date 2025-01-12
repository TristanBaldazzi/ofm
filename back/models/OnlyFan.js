const mongoose = require('mongoose');

// Plateformes autorisées
const allowedPlatforms = ['TikTok', 'X', 'Threads', 'Bluesky'];

// Schéma pour les réseaux sociaux associés
const socialMediaSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: allowedPlatforms, // Limite les plateformes autorisées
    required: true,
  },
  link: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^https?:\/\/.+$/.test(v); // Valide que le lien est une URL valide
      },
      message: (props) => `${props.value} n'est pas une URL valide.`,
    },
  },
  // Champs spécifiques aux plateformes
  twitterTokens: {
    appKey: { type: String, default: '0' },
    appSecret: { type: String, default: '0' },
    accessToken: { type: String, default: '0' },
    accessSecret: { type: String, default: '0' },
  },
  tiktokTokens: {
    apiKey: { type: String, default: '0' }, // Exemple pour TikTok
    secretKey: { type: String, default: '0' }, // Exemple pour TikTok
  },
});

socialMediaSchema.pre('validate', function (next) {
  // Efface les tokens inutiles en fonction de la plateforme
  if (this.platform === 'X') {
    this.tiktokTokens = undefined; // Supprime les tokens TikTok si la plateforme est Twitter
  } else if (this.platform === 'TikTok') {
    this.twitterTokens = undefined; // Supprime les tokens Twitter si la plateforme est TikTok
  } else {
    this.twitterTokens = undefined; // Supprime les tokens Twitter pour d'autres plateformes
    this.tiktokTokens = undefined; // Supprime les tokens TikTok pour d'autres plateformes
  }
  next();
});

// Schéma pour les tâches associées
const taskSchema = new mongoose.Schema({
  content: { type: String, required: true }, // Contenu de la tâche
  title: { type: String, required: true }, // Titre de la tâche
  description: { type: String }, // Description optionnelle
  socialPlatform: { 
    type: String, 
    required: true, 
    enum: allowedPlatforms, // Plateformes limitées aux valeurs autorisées
  },
  date: { type: Date, required: true }, // Date d'exécution de la tâche
  filePath: { type: String }, // Chemin vers un fichier associé (optionnel)
  // past: { type: Boolean, default: false},
  createdAt: { type: Date, default: Date.now }, // Date de création automatique
});

// Schéma principal pour "OnlyFan"
const onlyFanSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nom du profil
  description: { type: String }, // Description optionnelle du profil
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true,
  }, // Référence à une entreprise associée
  socialMedia: [socialMediaSchema], // Liste des réseaux sociaux associés avec tokens spécifiques par plateforme
  profilePicture: { 
    type: String, 
    default: '/uploads/default-profile.png',
  }, // Image de profil par défaut
  tasks: [taskSchema], // Liste des tâches associées au profil
  createdAt: { type: Date, default: Date.now }, // Date de création automatique
});

module.exports = mongoose.model('OnlyFan', onlyFanSchema);
