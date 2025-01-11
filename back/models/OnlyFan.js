const mongoose = require('mongoose');

const allowedPlatforms = ['TikTok', 'X', 'Threads', 'Bluesky'];

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
        return /^https?:\/\/.+$/.test(v); // Vérifie que le lien est une URL valide
      },
      message: (props) => `${props.value} n'est pas une URL valide.`,
    },
  },
});

const onlyFanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  socialMedia: [socialMediaSchema], // Tableau des réseaux sociaux avec validation
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('OnlyFan', onlyFanSchema);
