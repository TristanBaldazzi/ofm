module.exports = function generateLoginNotificationEmail(user, ipAddress, userAgent) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nouvelle Connexion</title>
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
          background-color: #007BFF; /* Changement de couleur */
          color: white;
          text-align: center;
          padding: 20px;
        }
        .header h1 {
          margin: 0;
        }
        .content {
          padding: 20px;
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
          color: #007BFF; /* Changement de couleur */
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- En-tête -->
        <div class="header">
          <h1>Nouvelle Connexion Détectée</h1>
        </div>

        <!-- Contenu principal -->
        <div class="content">
          <p>Bonjour ${user.email},</p>
          <p>Nous avons détecté une nouvelle connexion à votre compte :</p>
          
          <ul>
            <li><strong>Date :</strong> ${new Date().toLocaleString()}</li>
            <li><strong>Adresse IP :</strong> ${ipAddress}</li>
            <li><strong>Navigateur :</strong> ${userAgent}</li>
          </ul>

          <p>Si vous êtes à l'origine de cette connexion, aucune action n'est requise.</p>
          <p>Si ce n'est pas vous, veuillez sécuriser votre compte immédiatement en changeant votre mot de passe.</p>
          
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
