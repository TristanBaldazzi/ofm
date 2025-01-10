module.exports = function generateTwoFactorAuthEmail(userEmail, twoFactorCode) {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code de Double Authentification</title>
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
          .code {
            font-size: 24px;
            font-weight: bold;
            color: #007BFF; /* Couleur bleue harmonisée */
            margin: 20px auto;
            display: inline-block;
            padding: 10px 20px;
            border-radius: 5px;
            background-color: #f9f9f9;
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
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- En-tête -->
          <div class="header">
            <h1>Code de Double Authentification</h1>
          </div>
  
          <!-- Contenu principal -->
          <div class="content">
            <p>Bonjour,</p>
            
            <p>Pour compléter votre connexion, veuillez utiliser le code de double authentification ci-dessous :</p>
            
            <div class="code">${twoFactorCode}</div>
  
            <p>Ce code est valable pendant les prochaines cinq minutes.</p>
            
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
  