const express = require('express');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const isAdmin = require('../middleware/isAdmin');
const authenticate = require('../middleware/authTickets.js');
const transporter = require('../utils/emailTransporter');
const generateEmailTemplate = require('../utils/emailTemplate');
const router = express.Router();


// Récupérer tous les utilisateurs
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Modifier le rôle d'un utilisateur
router.put('/users/:id/role', isAdmin, async (req, res) => {
  const { role } = req.body;

  if (!['User', 'Admin'].includes(role)) {
    return res.status(400).json({ message: 'Rôle invalide.' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    user.role = role;
    await user.save();

    res.json({ message: 'Rôle mis à jour avec succès.', user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Supprimer un utilisateur
router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    await Ticket.deleteMany({ user: userId });

    await Company.updateMany(
      { members: userId },
      { $pull: { members: userId } } // Retirer l'utilisateur des membres
    );
    await Company.deleteMany({ userId }); // Supprimer les entreprises qu'il possède

    // Suppression des invitations associées à l'utilisateur (par email ou autre)
    await Invitation.deleteMany({ email: user.email });

    await User.findByIdAndDelete(userId);

    res.json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/users', isAdmin, async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !['User', 'Admin'].includes(role)) {
    return res.status(400).json({ message: 'Données invalides.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Cet email est déjà utilisé.' });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      email,
      password,
      role,
      verificationCode,
    });

    await newUser.save();

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: 'Vérification de votre adresse email',
      html: generateEmailTemplate(verificationCode),
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Utilisateur créé et email envoyé.', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.get('/tickets', authenticate, isAdmin, async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('user');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets.' });
  }
});

router.put('/tickets/:id/status', authenticate, isAdmin, async (req, res) => {
  const { newStatus } = req.body;
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé.' });

    ticket.status = newStatus;
    await ticket.save();
    res.json({ message: 'Statut du ticket mis à jour avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut du ticket.' });
  }
});

router.post('/tickets/:id/respond', authenticate, isAdmin, async (req, res) => {
  const { responseText } = req.body;
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé.' });

    if (ticket.status === 'closed') {
      return res.status(403).json({ message: 'Impossible d\'envoyer un message sur un ticket fermé.' });
    }

    ticket.messages.push({ sender: req.user.id, text: responseText });
    await ticket.save();
    res.json({ message: 'Réponse ajoutée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la réponse.' });
  }
});


module.exports = router;
