const mongoose = require('mongoose');

const allowedPlatforms = ['TikTok', 'X', 'Threads', 'Bluesky'];

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  socialPlatform: { 
    type: String, 
    required: true, 
    enum: ['TikTok', 'X', 'Threads', 'Bluesky'] // Restrict to these platforms 
  },
  date: { type: Date, required: true }, 
  createdAt: { type: Date, default: Date.now },
});

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
        return /^https?:\/\/.+$/.test(v);
      },
      message: (props) => `${props.value} n'est pas une URL valide.`,
    },
  },
});

const onlyFanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  socialMedia: [socialMediaSchema],
  profilePicture: { type: String, default: '/uploads/default-profile.png' },
  tasks: [taskSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('OnlyFan', onlyFanSchema);
