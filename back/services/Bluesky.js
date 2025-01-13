const { BskyAgent } = require('@atproto/api');

// Fonction utilitaire pour initialiser et connecter l'agent
async function initializeAgent(credentials) {
  const agent = new BskyAgent({ service: 'https://bsky.social' });
  try {
    await agent.login({
      identifier: credentials.username,
      password: credentials.password,
    });
    console.log('Agent connecté avec succès.');
    return agent;
  } catch (error) {
    console.error('Erreur lors de la connexion de l\'agent :', error.message);
    throw error;
  }
}

async function sendBlueskyPost(content, credentials) {
    const agent = await initializeAgent(credentials);
  
    try {
      // Vérification de la limite de caractères
      if (content.length > 300) {
        throw new Error(`Le contenu dépasse la limite de 300 caractères. Actuellement : ${content.length} caractères.`);
      }
  
      // Création du post
      const response = await agent.post({
        text: content,
        createdAt: new Date().toISOString(),
      });
  
      console.log('Post envoyé avec succès :', response);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du post :', error.message);
    }
  }

// // Exemple d'utilisation
// const credentials = {
//   username: 'rokafr.bsky.social', // Remplacez par votre identifiant Bluesky
//   password: 'timbep-rikbub-1Mypqo',        // Remplacez par votre mot de passe spécifique à l'application
// };

// const content = 'Ceci est un exemple de post sur Bluesky via l\'API. Assurez-vous que le contenu ne dépasse pas 300 caractères.';
// sendBlueskyPost(content, credentials);

module.exports = { sendBlueskyPost };
