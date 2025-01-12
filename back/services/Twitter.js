require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

// Fonction pour envoyer un tweet avec des tokens spécifiques
const sendTweet = async (message, tokens) => {
  try {
    // Initialiser un client Twitter spécifique à l'utilisateur
    const client = new TwitterApi({
      appKey: tokens.twitterApiKey,
      appSecret: tokens.twitterApiSecretKey,
      accessToken: tokens.accessToken,
      accessSecret: tokens.accessSecret,
    });

    const rwClient = client.readWrite;

    // Envoyer le tweet
    const response = await rwClient.v2.tweet(message);
    console.log(`Tweet envoyé avec succès pour ${tokens.username}:`, response);
  } catch (error) {
    console.error(`Erreur lors de l'envoi du tweet pour ${tokens.username}:`, error);
  }
};

// Export de la fonction
module.exports = { sendTweet };
