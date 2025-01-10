const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  averageRevenue: { type: Number, required: true },
  phoneNumber: { type: String, required: true },
  contactEmail: { type: String, required: true },
  siren: { type: String, required: true },
  companyType: { type: String, required: true },
  customActivity: { type: String },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Ouverte', 'Fermée', 'En cours de vérification'], default: 'En cours de vérification' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to User
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
});

module.exports = mongoose.model('Company', companySchema);
