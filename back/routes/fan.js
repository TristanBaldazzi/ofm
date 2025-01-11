const express = require('express');
const multer = require('multer');
const router = express.Router();
const OnlyFan = require('../models/OnlyFan');
const isAuth = require('../middleware/authMiddleware');
const checkAccessCompany = require('../middleware/checkAccessCompany');
const uploadTasks = require('../middleware/uploadTasks');

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

// Créer un OnlyFan
router.post('/create', isAuth, checkAccessCompany, upload.single('profilePicture'), async (req, res) => {
  const { name, description, companyId, socialMedia } = req.body;
  console.log(req.body);
  try {
    const allowedPlatforms = ['TikTok', 'X', 'Threads', 'Bluesky'];
    if (
      socialMedia.some(
        (media) => !allowedPlatforms.includes(media.platform)
      )
    ) {
      return res.status(400).json({
        message:
          "Seuls TikTok, X, Threads et Bluesky sont acceptés comme plateformes.",
      });
    }
    const profilePicturePath = req.file ? `/uploads/model/${req.file.filename}` : undefined;

    const newModel = new OnlyFan({
      name,
      description,
      companyId,
      socialMedia,
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

router.post('/:companyId/model/:id/task', isAuth, uploadTasks.single('file'), async (req, res) => {
    const { title, description, socialPlatform, date, content } = req.body;

    try {
      const model = await OnlyFan.findOne({ _id: req.params.id, companyId: req.params.companyId });

      if (!model) {
        return res.status(404).json({ error: 'Modèle non trouvé.' });
      }

      let filePath = null;
      if (req.file) {
        filePath = `/uploads/tasks/${req.file.filename}`;
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

module.exports = router;
