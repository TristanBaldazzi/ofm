module.exports = function generatePasswordChangeConfirmationEmail(userEmail) {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de Changement de Mot de Passe</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #007BFF; /* Couleur bleue harmonisée */
            color: white;
            text-align: center;
            padding: 20px;
          }
          .header h1 {
            margin: 0;
          }
          .content {
            padding: 20px;
            text-align: center;
          }
          .content p {
            font-size: 16px;
            line-height: 1.5;
          }
          .footer {
            background-color: #f4f4f4;
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #666666;
          }
          .footer a {
            color: #007BFF; /* Couleur bleue harmonisée */
            text-decoration: none;
          }
          @media (max-width: 600px) {
            .email-container {
              width: 100%;
              margin: auto;
              border-radius: 0;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- En-tête -->
          <div class="header">
            <h1>Changement de Mot de Passe</h1>
          </div>
  
          <!-- Contenu principal -->
          <div class="content">
            <p>Bonjour,</p>
            
            <p>Nous vous confirmons que le mot de passe associé à votre compte (<strong>${userEmail}</strong>) a été modifié avec succès.</p>
  
            <p>Si vous n'êtes pas à l'origine de ce changement, veuillez nous contacter immédiatement pour sécuriser votre compte.</p>
  
            <p>Merci,</p>
            <p>L'équipe Only Fan Manager</p>
          </div>
  
          <!-- Pied de page -->
          <div class="footer">
            <p>&copy; Only Fan Manager - Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  