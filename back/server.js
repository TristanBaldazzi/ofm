require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { sendTweet } = require('./services/Twitter');
const { sendBlueskyPost } = require('./services/Bluesky');
const OnlyFan = require('./models/OnlyFan');

const app = express();
const server = http.createServer(app);

// Middleware global pour parser JSON et gérer CORS
app.use(bodyParser.json());
app.use(cors());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur de connexion à MongoDB :', err));

// Middleware pour journaliser les requêtes
const logRouteExecution = (routePath) => {
  return (req, res, next) => {
    if (process.env.DEV_MODE == "true") {
      console.log(`---`);
      console.log(`Route exécutée : ${routePath}`);
      console.log(`Méthode HTTP : ${req.method}`);
      console.log(`Chemin complet : ${req.originalUrl}`);
      console.log(`Heure de la requête : ${new Date().toLocaleString()}`);
      console.log(`---`);
    }
    next();
  };
};

// Routes avec journalisation
app.use('/api/auth', logRouteExecution('/api/auth'), require('./routes/auth'));
app.use('/api/admin', logRouteExecution('/api/admin'), require('./routes/admin'));
app.use('/api/tickets', logRouteExecution('/api/tickets'), require('./routes/tickets'));
app.use('/api/company', logRouteExecution('/api/company'), require('./routes/company'));
app.use('/api/form', logRouteExecution('/api/form'), require('./routes/form'));
app.use('/api/fan', logRouteExecution('/api/fan'), require('./routes/fan'));

// Gestion de la route /uploads avec erreur pour mauvais chemin
app.use('/uploads', logRouteExecution('/uploads'), (req, res, next) => {
  if (req.method !== 'GET') {
    console.error(`Erreur : méthode ${req.method} non autorisée sur /uploads`);
    return res.status(405).json({ error: 'Méthode non autorisée sur cette route' });
  }
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Gestion des routes inexistantes pour /uploads
app.all('/uploads/*', (req, res) => {
  console.error(`Erreur : chemin invalide ${req.originalUrl}`);
  res.status(404).json({ error: 'Chemin invalide pour /uploads' });
});

async function checkTasks() {
  console.log("CheckTasks en cours...");
  const now = new Date();
  const profiles = await OnlyFan.find(); // Récupère tous les profils

  for (const profile of profiles) {
    for (const task of profile.tasks) {
      if(task.past == true) return;
      if (task.date < now && task.socialPlatform === 'X') {
        console.log(`Task "${task.title}" is past due and is for platform X.`);

        // Récupère les tokens Twitter du profil
        const twitterTokens = profile.socialMedia.find(
          (media) => media.platform === 'X'
        )?.twitterTokens;

        await OnlyFan.updateOne(
          { _id: profile._id, 'tasks._id': task._id },
          { $set: { 'tasks.$.past': true } }
        );

        if (twitterTokens) {
          // Inclure le chemin de fichier s'il existe
          await sendTweet(task.content, twitterTokens, task.filePath);
        } else {
          console.error(`No Twitter tokens found for profile: ${profile.name}`);
        }
      }
    }
  }
}

// Vérification initiale
checkTasks();

// Vérification toutes les 10 minutes
setInterval(checkTasks, 10 * 60 * 1000);

// const userTokens = {
//   username: 'User1',
//   twitterApiKey: 'vNSbaWp5DJQhoF8PpNOhZ3QM9',
//   twitterApiSecretKey: 'MnGRMLEI63duJs9dnQKMm59Ppey5ZPmPfADDBs4W4ZzLB4bInb',
//   accessToken: '1474152481802305549-aOT116FUWA0EQ7VUD2yvJuJtKZjr6H',
//   accessSecret: 'jWy1gsOuvv0YUPOIUFN0UD2RHyFFWcZOxyf6xXAfqQKrk',
// };

// sendTweet('Bonjour, ceci est un test de tweet !', userTokens);

// Exemple d'utilisation
// const credentials = {
//   username: 'rokafr.bsky.social', // Remplacez par votre identifiant Bluesky
//    password: 'timbep-rikbub-1Mypqo',        // Remplacez par votre mot de passe spécifique à l'application
//  };

// const content = 'Ceci est un exemple de post sur Bluesky via l\'API. Assurez-vous que le contenu ne dépasse pas 300 caractères.';
// sendBlueskyPost(content, credentials);

// Démarrage du serveur
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));

//MDP GMAIL : nohjo0-viPzik-xijrir