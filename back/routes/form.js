const express = require("express");
const jwt = require('jsonwebtoken');
const Form = require("../models/Form");
const Company = require('../models/Company');
const isAdmin = require("../middleware/isAdmin");
const mongoose = require('mongoose');
const router = express.Router();

// Créer un formulaire
router.post("/create", isAdmin, async (req, res) => {
  console.log("Requête reçue :", req.body); // Ajout du log
  const { companyId, details } = req.body;

  if (!companyId || !details || !details.fields || details.fields.length === 0) {
    return res.status(400).json({ message: "Données invalides." });
  }

  try {
    const newForm = new Form({
      companyId: companyId,
      details: {
        title: details.title,
        description: details.description,
        theme: details.theme, // Gestion total theme (couleurs)
        fields: details.fields,
      },
    });

    await newForm.save();
    res.status(201).json({ message: "Formulaire créé avec succès.", form: newForm });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// Récupérer un formulaire par ID
router.get("/:id", async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { id } = req.params;
    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({ message: "Formulaire introuvable." });
    }

    const company = await Company.findById(form.companyId);

    if (!company) {
      return res.status(404).json({ message: "Entreprise associée introuvable." });
    }

    const isOwner = company.userId.toString() === userId;
    const isMember = company.members.some(member => member.toString() === userId);

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Accès refusé : Vous n'êtes ni propriétaire ni membre de cette entreprise." });
    }

    res.status(200).json(form);
  } catch (error) {
    console.error("Erreur lors de la récupération du formulaire :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// Soumettre les réponses à un formulaire
router.post("/:id/submit", async (req, res) => {
  const { id } = req.params;
  const { formData } = req.body;

  try {
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: "Formulaire introuvable." });
    }

    const newResponse = {
      responseId: new mongoose.Types.ObjectId(),
      formData,
    };

    form.responses.push(newResponse);
    await form.save();

    res.status(201).json({ message: "Réponses enregistrées avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

router.get("/list/admin", isAdmin, async (req, res) => {
  try {
    const forms = await Form.find().populate("companyId", "name"); // Optionnel : inclure le nom de l'entreprise
    res.status(200).json(forms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// Mise à jour du thème d'un formulaire
router.put("/:id/update-theme", isAdmin, async (req, res) => {
  const { id } = req.params; // ID du formulaire
  const { theme } = req.body; // Nouveau thème envoyé depuis le client

  try {
    // Trouver et mettre à jour le formulaire avec le nouveau thème
    const form = await Form.findByIdAndUpdate(
      id,
      { "details.theme": theme }, // Met à jour uniquement le champ "theme"
      { new: true } // Retourne le document mis à jour
    );

    if (!form) {
      return res.status(404).json({ message: "Formulaire introuvable." });
    }

    res.status(200).json({ message: "Thème mis à jour avec succès.", form });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du thème :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
