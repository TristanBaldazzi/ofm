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
  group: {
    type: String,
    default: function () {
      return `Groupe ${this._id}`; // Nom par défaut du groupe
    },
  },
  warn: {
    state: { type: Boolean, default: false }, // État de l'avertissement
    content: { type: String, required: function () { return this.state; } }, // Contenu requis si warn est true
  },
  twitterTokens: {
    appKey: { type: String, default: '0' },
    appSecret: { type: String, default: '0' },
    accessToken: { type: String, default: '0' },
    accessSecret: { type: String, default: '0' },
  },
  tiktokTokens: {
    apiKey: { type: String, default: '0' },
    secretKey: { type: String, default: '0' },
  },
  threadsTokens: {
    appKey: { type: String, default: '0' },
    appSecret: { type: String, default: '0' },
    accessToken: { type: String, default: '0' },
    accessSecret: { type: String, default: '0' },
  },
  blueskyTokens: {
    name: { type: String, default: '0' },
    pass: { type: String, default: '0' },
  },
});


socialMediaSchema.pre('validate', function (next) {
  if (this.platform === 'X') {
    this.tiktokTokens = undefined;
    this.blueskyTokens = undefined;
    this.threadsTokens = undefined;
  } else if (this.platform === 'TikTok') {
    this.blueskyTokens = undefined;
    this.twitterTokens = undefined;
    this.threadsTokens = undefined;
  } else if (this.platform === 'Threads') {
    this.twitterTokens = undefined;
    this.tiktokTokens = undefined;
    this.blueskyTokens = undefined;
  } else if (this.platform === 'Bluesky') {
    this.twitterTokens = undefined;
    this.tiktokTokens = undefined;
    this.threadsTokens = undefined;
  } else {
    this.twitterTokens = undefined;
    this.tiktokTokens = undefined;
    this.threadsTokens = undefined;
    this.blueskyTokens = undefined;
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
  group: { type: String, required: true },
  type : {type: String, required: true},
  date: { type: Date, required: true }, // Date d'exécution de la tâche
  filePath: { type: String }, // Chemin vers un fichier associé (optionnel)
  past: { type: Boolean, default: false},
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
  socialMediaGroupsCount: { type: Number, default: 0 },
  socialMedia: { type: [socialMediaSchema], default: [] }, // Liste des réseaux sociaux associés avec tokens spécifiques par plateforme
  profilePicture: { 
    type: String, 
    default: '/uploads/default-profile.png',
  }, // Image de profil par défaut
  tasks: [taskSchema], // Liste des tâches associées au profil
  createdAt: { type: Date, default: Date.now }, // Date de création automatique
});

module.exports = mongoose.model('OnlyFan', onlyFanSchema);
