const express = require('express');
const multer = require('multer');
const Ticket = require('../models/Ticket');
const authenticate = require('../middleware/authTickets.js');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();

// Créer un ticket
router.post('/', authenticate, async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;

  try {
    const ticket = new Ticket({ title, description, user: userId });
    await ticket.save();

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du ticket.' });
  }
});

// Récupérer les tickets d'un utilisateur
router.get('/', authenticate,  async (req, res) => {
  const userId = req.user.id;

  try {
    const tickets = await Ticket.find({ user: userId });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets.' });
  }
});

// Récupérer un ticket par ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('messages.sender');
    if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé.' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Configuration de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Dossier où stocker les fichiers
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nom unique basé sur la date
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite à 10 Mo
});

// Ajouter un message avec fichier à un ticket
router.post('/:id/messages', authenticate, upload.single('file'), async (req, res) => {
  const { text } = req.body;
  const userId = req.user.id;

  try {
    const ticket = await Ticket.findById(req.params.id).populate('user');
    if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé.' });

    const messageData = { sender: userId, text };
    if (req.file) {
      messageData.file = req.file.filename; // Enregistrer le nom du fichier dans MongoDB
    }

    ticket.messages.push(messageData);
    await ticket.save();

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout du message.' });
  }
});

// Fermer un ticket
router.put('/:id/close', isAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé.' });

    ticket.status = 'closed';
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la fermeture du ticket.' });
  }
});

module.exports = router;
