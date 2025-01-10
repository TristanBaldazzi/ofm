const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const router = express.Router();
const transporter = require('../utils/emailTransporter');
const generateEmailTemplate = require('../utils/emailTemplate');
const generateLoginNotificationEmail = require('../utils/connexionTemplate');
const generateTwoFactorAuthEmail = require('../utils/twoFactorAuthEmail');
const generateResetPasswordEmailTemplate = require('../utils/resetPasswordEmailTemplate');
const generatePasswordChangeConfirmationEmail = require('../utils/passwordChangeConfirmationEmail');
const verifyCaptcha = require("../middleware/verifyCaptcha");

// Inscription
router.post('/signup', verifyCaptcha, async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Utilisateur déjà existant' });

    // Génération du code aléatoire
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({ email, password, verificationCode });
    await user.save();

    // Envoi de l'email avec le code
    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: 'Vérification de votre adresse email',
      html: generateEmailTemplate(verificationCode)
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé à ${email} avec le sujet : Vérification de votre adresse email`);

    res.status(201).json({ message: 'Utilisateur créé. Vérifiez votre email pour le code.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/verify-email', async (req, res) => {
  const { verificationCode } = req.body; // Le code envoyé par l'utilisateur
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Récupère le token

  if (!token) {
    return res.status(401).json({ message: 'Token manquant.' });
  }

  try {
    // Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Trouve l'utilisateur correspondant au token
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    // Vérifie si le code correspond
    if (user.verificationCode === verificationCode) {
      user.isVerified = true; // Marque l'utilisateur comme vérifié
      user.verificationCode = null; // Supprime le code après vérification
      await user.save();
      return res.status(200).json({ message: 'Email vérifié avec succès.' });
    } else {
      return res.status(400).json({ message: 'Code de vérification incorrect.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
});

router.post("/login", verifyCaptcha, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    if (user.twoFactorEnabled) {
      const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorCode = twoFactorCode;
      user.twoFactorExpires = Date.now() + 300000; // Expire dans 5 minutes
      await user.save();

      const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: "Votre code de double authentification",
        html: generateTwoFactorAuthEmail(email, twoFactorCode),
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email envoyé à ${email} avec le sujet : Votre code de double authentification`);

      return res.json({ message: "Code de double authentification envoyé." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route /me
router.get('/me', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password'); // Exclure le mot de passe
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
});

// Route protégée (exemple)
router.get('/protected', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'Admin') {
      return res.status(403).json({ message: 'Accès refusé : Admin uniquement' });
    }

    res.json({ message: `Bienvenue Admin ID : ${decoded.id}` });
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();

    const resetCode = `OFM-${randomHex}`;
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: 'Réinitialisation du mot de passe',
      html: generateResetPasswordEmailTemplate(resetCode),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé à ${email} avec le sujet : Réinitialisation du mot de passe`);

    res.json({ message: 'Email envoyé avec le code de vérification.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { code, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Code invalide ou expiré' });

    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: user.email,
      subject: 'Confirmation de Changement de Mot de Passe',
      html: generatePasswordChangeConfirmationEmail(user.email),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé à ${user.email} avec le sujet : Confirmation de Changement de Mot de Passe`);

    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/verify-2fa', async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({
      email,
      twoFactorCode: code,
      twoFactorExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Code invalide ou expiré' });

    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/enable-2fa', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: 'Double authentification activée.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


router.post('/change-password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Ancien mot de passe incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Mot de passe changé avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/disable-2fa', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    user.twoFactorEnabled = false;
    await user.save();

    res.json({ message: 'Double authentification désactivée.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/verify-token', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.json({ message: 'Token valide.', user });
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
});

module.exports = router;
