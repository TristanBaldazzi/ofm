const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');

// Fonction pour envoyer un tweet avec ou sans image
async function sendTweet(content, tokens, filePath = null) {
  const client = new TwitterApi({
    appKey: tokens.appKey,
    appSecret: tokens.appSecret,
    accessToken: tokens.accessToken,
    accessSecret: tokens.accessSecret,
  });

  const rwClient = client.readWrite;

  try {
    let mediaId = null;

    if (filePath != null) {
      console.log("ee");
      // Vérification si le fichier existe
      const fullPath = path.join(__dirname, '../uploads/tasks', filePath);
      if (fs.existsSync(fullPath)) {
        console.log(`Uploading image: ${filePath}`);
        // Téléchargement de l'image via l'API v1.1
        mediaId = await client.v1.uploadMedia(fullPath);
        console.log(`Image uploaded successfully with Media ID: ${mediaId}`);
      } else {
        console.error(`File not found at path: ${fullPath}`);
      }
    }

    // Création du tweet
    const tweetData = {
      text: content,
      ...(mediaId && { media: { media_ids: [mediaId] } })
    };
    
    console.log(tweetData);
    
    const response = await rwClient.v2.tweet(tweetData);
    console.log(`Tweet sent successfully! Tweet ID: ${response.id_str}`);
  } catch (error) {
    console.error('Error while sending tweet:', error);
  }
}

// Export de la fonction
module.exports = { sendTweet };
