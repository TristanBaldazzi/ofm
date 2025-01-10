const express = require('express');
const Company = require('../models/Company');
const Form = require("../models/Form");
const jwt = require('jsonwebtoken');
const isAdmin = require('../middleware/isAdmin');
const isAuth = require('../middleware/authMiddleware.js');
const router = express.Router();
const generateInvitationEmailTemplate = require("../utils/generateInvitationEmailTemplate");
const transporter = require('../utils/emailTransporter');
const User = require('../models/User');
const Invitation = require('../models/Invitation');

router.post('/create-company', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Extract user ID from the token

    const {
      name,
      location,
      averageRevenue,
      phoneNumber,
      contactEmail,
      siren,
      companyType,
      customActivity
    } = req.body;

    const newCompany = new Company({
      name,
      location,
      averageRevenue,
      phoneNumber,
      contactEmail,
      siren,
      companyType,
      customActivity,
      userId // Associate with the current user
    });

    await newCompany.save();
    res.status(201).json({ message: 'Entreprise créée avec succès.', companyId: newCompany._id });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'entreprise.' });
  }
});

router.get('/companies', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // ID de l'utilisateur extrait du token

    // Récupérer toutes les entreprises associées à cet utilisateur
    const companies = await Company.find({
      $or: [
        { userId }, // Entreprises créées par cet utilisateur
        { members: userId } // Entreprises où cet utilisateur est membre
      ]
    });
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des entreprises.' });
  }
});

router.get('/entreprise/:id', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log("Token reçu:", req.params.id); // Log du token

  if (!token) {
    console.log("Aucun token fourni");
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // ID de l'utilisateur extrait du token
    console.log("ID utilisateur décodé:", userId); // Log de l'ID utilisateur

    const companyId = req.params.id;

    // Vérifier si l'utilisateur est le créateur ou un membre
    const company = await Company.findOne({
      _id: companyId,
      $or: [
        { userId }, // Créateur
        { members: userId } // Membre
      ]
    });

    if (!company) {
      return res.status(403).json({ message: 'Accès refusé : Vous n\'êtes ni propriétaire ni membre de cette entreprise.' });
    }

    res.status(200).json(company);
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de l'entreprise:", error); // Log de l'erreur
    res.status(500).json({ message: 'Erreur lors de la récupération des détails de l\'entreprise.' });
  }
});

router.put('/entreprise/:id', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // ID de l'utilisateur extrait du token

    const companyId = req.params.id;

    // Vérifier si l'utilisateur est le créateur ou un membre
    const company = await Company.findOne({
      _id: companyId,
      $or: [
        { userId }, // Créateur
        { members: userId } // Membre
      ]
    });

    if (!company) {
      return res.status(403).json({ message: 'Accès refusé : Vous n\'êtes ni propriétaire ni membre de cette entreprise.' });
    }
    // Mettre à jour les informations de l'entreprise
    const updatedData = req.body;
    Object.assign(company, updatedData); // Met à jour les champs de l'entreprise avec les données reçues
    await company.save();

    res.status(200).json({ message: 'Entreprise mise à jour avec succès.', company });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entreprise :", error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'entreprise.' });
  }
});


router.get('/admin/entreprise/:id', isAdmin, async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const companyId = req.params.id;

    const company = await Company.findOne({ _id: companyId });
    if (!company) return res.status(404).json({ message: 'Entreprise non trouvée.' });

    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des détails de l\'entreprise.' });
  }
});

router.put('/admin/entreprise/:id', isAdmin, async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const companyId = req.params.id;

    // Vérifiez que l'entreprise appartient à l'utilisateur
    const company = await Company.findOne({ _id: companyId });
    if (!company) return res.status(403).json({ message: 'Accès refusé.' });

    // Mettre à jour les informations de l'entreprise
    Object.assign(company, req.body);
    await company.save();

    res.status(200).json({ message: 'Entreprise mise à jour avec succès.', company });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour.' });
  }
});


router.put('/admin/statut/:id', isAdmin, async (req, res) => {
  try {
    const companyId = req.params.id;
    const { status } = req.body;

    if (!['Ouverte', 'Fermée', 'En cours de vérification'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Entreprise non trouvée.' });

    company.status = status;
    await company.save();

    res.status(200).json({ message: 'Statut mis à jour avec succès.', company });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut.' });
  }
});

router.get('/admin/companies', isAdmin, async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des entreprises.' });
  }
});

router.delete('/admin/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Recherche et suppression de l'entreprise
    const company = await Company.findByIdAndDelete(id);

    if (!company) {
      return res.status(404).json({ message: "Entreprise non trouvée." });
    }

    res.status(200).json({ message: "Entreprise supprimée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'entreprise :", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression de l'entreprise." });
  }
});

router.post('/invite', async (req, res) => {
  const { companyId, email } = req.body;
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Vérifier si l'utilisateur est propriétaire de l'entreprise
    const company = await Company.findOne({ _id: companyId, userId });
    if (!company) return res.status(403).json({ message: "Vous n'êtes pas autorisé à inviter des utilisateurs." });

    const isMember = company.members.some(
      (userId) => userId.toString() === userId.toString()
    );
    if (isMember) {
      return res.status(400).json({ message: "Cet utilisateur est déjà membre de l'entreprise." });
    }

    const existingInvitation = await Invitation.findOne({
      companyId,
      email,
      status: "Pending",
    });
    if (existingInvitation) {
      return res.status(400).json({
        message:
          "Une invitation est déjà en attente pour cet utilisateur. Veuillez attendre qu'elle soit traitée.",
      });
    }

    // Générer un JWT pour l'invitation
    const invitationToken = jwt.sign({ companyId, email }, process.env.JWT_SECRET, { expiresIn: '14d' });

    // Stocker l'invitation dans la base de données
    const invitation = new Invitation({
      companyId,
      email,
      token: invitationToken,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Expire dans 14 jours
    });
    await invitation.save();

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: `Invitation à rejoindre ${company.name}`,
      html: generateInvitationEmailTemplate(company.name, `${process.env.FRONTEND_URL}/accept-invitation?token=${invitationToken}`)
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Invitation envoyée avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'envoi de l'invitation." });
  }
});

// Route pour accepter/refuser une invitation
router.post('/respond-invitation', async (req, res) => {
  const { token, response } = req.body; // response peut être "Accepted" ou "Declined"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { companyId, email } = decoded;

    // Vérifier si l'invitation existe et n'a pas expiré
    const invitation = await Invitation.findOne({ token, email, companyId });
    if (!invitation || new Date() > invitation.expiresAt) {
      return res.status(400).json({ message: "L'invitation est invalide ou a expiré." });
    }

    if (invitation.status !== "Pending") {
      return res.status(400).json({ message: "Cette invitation a déjà été traitée." });
    }

    // Mettre à jour le statut de l'invitation
    invitation.status = response;
    await invitation.save();

    if (response === 'Accepted') {
      // Ajouter l'utilisateur à l'entreprise s'il accepte
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

      // Ajoutez ici la logique pour associer l'utilisateur à l'entreprise (par exemple via un tableau `members` dans le modèle `Company`).
      await Company.updateOne(
        { _id: companyId },
        { $addToSet: { members: user._id } }
      );

      res.status(200).json({ message: "Invitation acceptée avec succès." });
    } else {
      res.status(200).json({ message: "Invitation refusée." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors du traitement de l'invitation." });
  }
});

router.post('/get-invitation-details', async (req, res) => {
  const { token } = req.body;

  try {
    // Décoder le token pour obtenir les infos
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { companyId } = decoded;

    // Récupérer les détails de l'entreprise
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Entreprise non trouvée." });

    res.status(200).json({ company });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Token invalide ou expiré." });
  }
});

router.get("/members/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;

    // Récupérer l'entreprise et ses membres avec leurs détails
    const company = await Company.findById(companyId).populate("members", "email name");
    if (!company) {
      return res.status(404).json({ message: "Entreprise non trouvée." });
    }

    res.status(200).json({ members: company.members });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des membres." });
  }
});

router.delete("/members/:companyId/:memberId", async (req, res) => {
  const { companyId, memberId } = req.params;

  try {
    // Trouver l'entreprise
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Entreprise non trouvée." });
    }

    // Supprimer le membre de la liste
    company.members = company.members.filter(
      (id) => id.toString() !== memberId
    );
    await company.save();

    res.status(200).json({ message: "Membre supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression du membre." });
  }
});

router.get("/invitations/:companyId", async (req, res) => {
  const { companyId } = req.params;

  try {
    // Récupérer toutes les invitations en attente pour la société
    const invitations = await Invitation.find({ companyId, status: "Pending" });
    res.status(200).json({ invitations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des invitations." });
  }
});

router.delete("/invitations/:invitationId", async (req, res) => {
  const { invitationId } = req.params;

  try {
    // Supprimer l'invitation par ID
    await Invitation.findByIdAndDelete(invitationId);
    res.status(200).json({ message: "Invitation supprimée avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression de l'invitation." });
  }
});

// Fetch forms by company ID
router.get("/:companyId/forms", isAuth, async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { companyId } = req.params;
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: "Entreprise non trouvée." });
    }

    const isOwner = company.userId.toString() === userId;
    const isMember = company.members.some(member => member.toString() === userId);

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Accès refusé : Vous n'êtes ni propriétaire ni membre de cette entreprise." });
    }

    const forms = await Form.find({ companyId }).populate("companyId", "name");

    if (!forms || forms.length === 0) {
      return res.status(200).json(forms);
    }

    res.status(200).json(forms);
  } catch (error) {
    console.error("Erreur lors de la récupération des formulaires :", error);
    res.status(500).json({ message: "Erreur du serveur." });
  }
});

module.exports = router;
