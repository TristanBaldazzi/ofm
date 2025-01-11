const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Définir le stockage avec des noms de fichiers aléatoires
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/tasks/')); // Chemin de stockage
  },
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomBytes(16).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Filtrer les fichiers pour accepter uniquement les images et vidéos
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mpeg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers image ou vidéo sont autorisés.'));
  }
};

// Limite de taille : 100 Mo
const uploadTasks = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Taille maximale en octets
  fileFilter,
});

module.exports = uploadTasks;
