const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');
const fs = require('fs');
const router = express.Router();
const path = require('path');
const OnlyFan = require('../models/OnlyFan');
const isAuth = require('../middleware/authMiddleware');
const checkAccessCompany = require('../middleware/checkAccessCompany');
const uploadTasks = require('../middleware/uploadTasks');
const xlsx = require('xlsx');
const { BskyAgent } = require('@atproto/api');

// Configuration Multer pour stocker les images dans /uploads/model
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/model');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const uploadExcel = multer({ dest: 'uploads/excel/' });

// Créer un OnlyFan
router.post('/create', isAuth, checkAccessCompany, upload.single('profilePicture'), async (req, res) => {
  const { name, description, companyId } = req.body; // Pas besoin de récupérer socialMedia ici
  try {
    const profilePicturePath = req.file ? `/uploads/model/${req.file.filename}` : undefined;

    const newModel = new OnlyFan({
      name,
      description,
      companyId,
      profilePicture: profilePicturePath || '/uploads/model/default-profile.png',
    });

    const savedModel = await newModel.save();
    res.status(201).json(savedModel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer tous les OnlyFans d'une entreprise
router.get('/:companyId', isAuth, checkAccessCompany, async (req, res) => {
  try {
    const onlyFans = await OnlyFan.find({ companyId: req.params.companyId }).populate('companyId');
    res.status(200).json(onlyFans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer un seul OnlyFan
router.get('/:companyId/:id', isAuth, checkAccessCompany, async (req, res) => {
  try {
    const onlyFan = await OnlyFan.findById(req.params.id).populate('companyId');
    if (!onlyFan) return res.status(404).json({ message: 'OnlyFan non trouvé' });

    res.status(200).json(onlyFan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mettre à jour un OnlyFan
router.put('/:id', isAuth, checkAccessCompany, async (req, res) => {
  try {
    const updatedOnlyFan = await OnlyFan.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedOnlyFan) return res.status(404).json({ message: 'OnlyFan non trouvé' });

    res.status(200).json(updatedOnlyFan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Supprimer un OnlyFan
router.delete('/:companyId/:id', isAuth, checkAccessCompany, async (req, res) => {
  try {
    const deletedOnlyFan = await OnlyFan.findByIdAndDelete(req.params.id);

    if (!deletedOnlyFan) return res.status(404).json({ message: 'OnlyFan non trouvé' });

    res.status(200).json({ message: 'OnlyFan supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:companyId/model/:id/tasks/import', uploadExcel.single('file'), async (req, res) => {
  try {
    const { file } = req;

    // Vérification si un fichier a été fourni
    if (!file) {
      return res.status(400).json({ error: 'Aucun fichier fourni.' });
    }

    // Charger le fichier Excel avec ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);

    const worksheet = workbook.worksheets[0]; // Supposons que nous travaillons avec la première feuille
    const tasks = [];
    const imageFolderPath = path.join(__dirname, '../uploads/tasks/');

    // Créer le dossier des images s'il n'existe pas
    if (!fs.existsSync(imageFolderPath)) {
      fs.mkdirSync(imageFolderPath, { recursive: true });
    }

    // Parcourir les lignes pour extraire les données et les images
    worksheet.eachRow({ includeEmpty: false }, (row, rowIndex) => {
      if (rowIndex === 1) return; // Ignorer l'en-tête

      const title = row.getCell(1).value; // Colonne A
      const description = row.getCell(2).value; // Colonne B
      const socialPlatform = row.getCell(3).value; // Colonne C
      const date = row.getCell(4).value; // Colonne D
      const content = row.getCell(5).value; // Colonne E

      let imagePath = null;

      // Extraire les images associées à cette ligne
      const images = worksheet.getImages(); // Récupérer toutes les images de la feuille

      for (const image of images) {
        const { tl } = image.range; // Coordonnées de l'image (top-left)
        if (tl.nativeRow === rowIndex - 1) { // Vérifier si l'image est associée à cette ligne
          const imgData = workbook.model.media.find((m) => m.index === image.imageId); // Trouver l'image correspondante
          if (imgData) {
            const imageName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${imgData.extension}`;
            const absoluteImagePath = path.join(imageFolderPath, imageName); // Chemin absolu pour sauvegarder l'image
            const relativeImagePath = `${imageName}`; // Chemin relatif pour la base de données

            fs.writeFileSync(absoluteImagePath, imgData.buffer); // Sauvegarde de l'image sur le disque
            console.log(`Image sauvegardée : ${relativeImagePath}`);
            imagePath = relativeImagePath; // Enregistrer uniquement le chemin relatif
          }
        }
      }
      console.log('Tâches à ajouter :', tasks);
      tasks.push({
        title,
        description,
        socialPlatform,
        date,
        content,
        filePath: imagePath,
      });
    });

    const model = await OnlyFan.findOne({ _id: req.params.id, companyId: req.params.companyId });
    if (!model) {
      return res.status(404).json({ error: 'Modèle non trouvé.' });
    }

    model.tasks.push(...tasks);
    await model.save();

    // Supprimer le fichier temporaire après traitement
    fs.unlinkSync(file.path);

    res.status(201).json({ message: 'Tâches importées avec succès.', tasks });
  } catch (error) {
    console.error('Erreur lors de l\'importation des données :', error);
    res.status(500).json({ error: "Erreur lors de l'importation des données." });
  }
});

router.post('/:companyId/model/:id/task', isAuth, uploadTasks.single('file'), async (req, res) => {
  const { title, description, socialPlatform, date, content } = req.body;

  try {
    const model = await OnlyFan.findOne({ _id: req.params.id, companyId: req.params.companyId });

    if (!model) {
      return res.status(404).json({ error: 'Modèle non trouvé.' });
    }

    let filePath = null;
    if (req.file) {
      filePath = `${req.file.filename}`;
    }

    const newTask = { title, description, socialPlatform, date, content };
    if (filePath) newTask.filePath = filePath; // Ajoutez le chemin du fichier si présent

    model.tasks.push(newTask);
    await model.save();

    res.status(201).json({ message: 'Tâche ajoutée avec succès.', task: newTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'ajout de la tâche." });
  }
}
);

router.put('/:companyId/model/:id/task/:taskId', isAuth, async (req, res) => {
  const { title, description, socialPlatform } = req.body;

  try {
    const model = await OnlyFan.findOne({ _id: req.params.id, companyId: req.params.companyId });

    if (!model) {
      return res.status(404).json({ error: 'Modèle non trouvé.' });
    }

    const task = model.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée.' });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.socialPlatform = socialPlatform || task.socialPlatform;
    await model.save();

    res.status(200).json({ message: 'Tâche mise à jour avec succès.', task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise à jour de la tâche." });
  }
});

router.delete('/:companyId/model/:id/task/:taskId', isAuth, async (req, res) => {
  try {
    // Récupérer le modèle associé
    const model = await OnlyFan.findOne({ _id: req.params.id, companyId: req.params.companyId });
    if (!model) {
      return res.status(404).json({ error: 'Modèle non trouvé.' });
    }

    // Supprimer la tâche directement depuis le tableau en utilisant .pull()
    const taskIndex = model.tasks.findIndex(task => task._id.toString() === req.params.taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Tâche non trouvée.' });
    }

    model.tasks.splice(taskIndex, 1); // Retirer la tâche du tableau
    await model.save();

    res.status(200).json({ message: 'Tâche supprimée avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la tâche.' });
  }
});

const allowedPlatforms = ["TikTok", "X", "Threads", "Bluesky"];

async function verifyBlueskyConnection(username, password) {
  const agent = new BskyAgent({
    service: 'https://bsky.social', // URL du service Bluesky
  });

  try {
    // Tenter de se connecter avec les identifiants
    await agent.login({ identifier: username, password: password });
    return true;
  } catch (error) {
    console.error("Erreur de connexion :", error.message); // Connexion échouée
    return false;
  }
}

const platformTokenRequirements = {
  TikTok: ["apiKey", "secretKey"],
  X: ["appKey", "appSecret", "accessToken", "accessSecret"],
  Threads: ["appKey", "appSecret", "accessToken", "accessSecret"],
  Bluesky: ["name", "pass"],
};

// Route pour ajouter un réseau social
router.post("/:companyId/:modelId/social-media", isAuth, async (req, res) => {
  try {
    const { modelId } = req.params;
    const { platform, groupNumber, tokens } = req.body;

    // Vérifiez que toutes les informations nécessaires sont fournies
    if (!platform || !groupNumber || !tokens) {
      return res.status(400).json({ message: "Données manquantes." });
    }

    // Vérifiez si la plateforme est Bluesky et testez la connexion
    if (platform === "Bluesky") {
      const { name, pass } = tokens;

      if (!name || !pass) {
        return res.status(400).json({
          message: "Nom et mot de passe requis pour se connecter à Bluesky.",
        });
      }

      try {
        const isConnected = await verifyBlueskyConnection(name, pass);
        if (isConnected) {
          console.log("Connexion réussie à Bluesky."); // Loguez si la connexion réussit
        } else {
        return res.status(400).json({
          message: "Connexion à Bluesky échouée. Veuillez vérifier vos identifiants.",
        });
        }
      } catch (err) {
        console.error(err.message);
        return res.status(400).json({
          message: "Connexion à Bluesky échouée. Veuillez vérifier vos identifiants.",
        });
      }
    }

    // Récupérer le modèle OnlyFan
    const model = await OnlyFan.findById(modelId);
    if (!model) {
      return res.status(404).json({ message: "Modèle non trouvé." });
    }

    // Ajouter le réseau social au modèle
    model.socialMedia.push({
      platform,
      group: `Groupe ${groupNumber}`,
      [`${platform.toLowerCase()}Tokens`]: tokens,
    });

    await model.save();

    res.status(201).json({
      message: `Le réseau social ${platform} a été ajouté avec succès.`,
      socialMedia: model.socialMedia,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

router.delete("/:companyId/:modelId/social-media/:platform/:group", isAuth, async (req, res) => {
  try {
    const { modelId, platform, group } = req.params;

    // Récupérer le modèle OnlyFan
    const model = await OnlyFan.findById(modelId);
    if (!model) {
      return res.status(404).json({ message: "Modèle non trouvé." });
    }

    // Filtrer les réseaux sociaux pour supprimer celui correspondant
    const initialLength = model.socialMedia.length;
    model.socialMedia = model.socialMedia.filter(
      (media) => !(media.platform === platform && media.group === group)
    );

    if (model.socialMedia.length === initialLength) {
      return res.status(404).json({
        message: `Le réseau social ${platform} dans le groupe ${group} n'a pas été trouvé.`,
      });
    }

    await model.save();

    res.status(200).json({
      message: `Le réseau social ${platform} a été supprimé du groupe ${group}.`,
      socialMedia: model.socialMedia,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

module.exports = router;
