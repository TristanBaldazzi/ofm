require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { sendTweet } = require('./services/Twitter');

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

const userTokens = {
  username: 'User1',
  twitterApiKey: 'vNSbaWp5DJQhoF8PpNOhZ3QM9',
  twitterApiSecretKey: 'MnGRMLEI63duJs9dnQKMm59Ppey5ZPmPfADDBs4W4ZzLB4bInb',
  accessToken: '1474152481802305549-aOT116FUWA0EQ7VUD2yvJuJtKZjr6H',
  accessSecret: 'jWy1gsOuvv0YUPOIUFN0UD2RHyFFWcZOxyf6xXAfqQKrk',
};

// sendTweet('Bonjour, ceci est un test de tweet !', userTokens);

// Démarrage du serveur
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));

//MDP GMAIL : nohjo0-viPzik-xijrir