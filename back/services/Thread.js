const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Fonction pour poster un message sur Threads
async function postMessageOnThreads(content, tokens, filePath = null) {
  try {
    let mediaId = null;

    // Vérification et téléchargement de l'image si elle existe
    if (filePath) {
      const fullPath = path.join(__dirname, filePath);
      if (fs.existsSync(fullPath)) {
        console.log(`Uploading image: ${filePath}`);
        const imageData = fs.readFileSync(fullPath);

        // Envoi de l'image à l'API Threads
        const mediaResponse = await axios.post(
          'https://graph.threads.net/v1/media/upload',
          imageData,
          {
            headers: {
              'Authorization': `Bearer ${tokens.accessToken}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        mediaId = mediaResponse.data.media_id;
        console.log(`Image uploaded successfully with Media ID: ${mediaId}`);
      } else {
        console.error(`File not found at path: ${fullPath}`);
      }
    }

    // Préparation des données du post
    const postData = {
      text: content,
      ...(mediaId && { media_id: mediaId }),
    };

    // Publication du message via l'API Threads
    const response = await axios.post(
      'https://graph.threads.net/v1/posts',
      postData,
      {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`Post sent successfully! Post ID: ${response.data.id}`);
  } catch (error) {
    console.error('Error while posting message on Threads:', error.response?.data || error.message);
  }
}

// Exemple d'utilisation
// const tokens = {
//   accessToken: 'votre_token_d_access',
// };
// postMessageOnThreads('Voici un message publié sur Threads !', tokens, './image.jpg');

module.exports = { postMessageOnThreads };
