module.exports = function generateInvitationEmailTemplate(companyName, invitationLink) {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation à rejoindre une entreprise</title>
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
          .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 16px;
            font-weight: bold;
            color: white; /* Texte en blanc */
            background-color: #007BFF; /* Couleur bleue harmonisée */
            text-decoration: none;
            border-radius: 5px;
          }
          .button:hover {
            background-color: #0056b3; /* Couleur bleue plus foncée */
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
            <h1>Invitation à rejoindre ${companyName}</h1>
          </div>
  
          <!-- Contenu principal -->
          <div class="content">
            <p>Bonjour,</p>
            <p>Vous avez été invité à rejoindre l'entreprise <strong>${companyName}</strong>.</p>
            
            <p>Cliquez sur le bouton ci-dessous pour accepter l'invitation :</p>
  
            <a href="${invitationLink}" class="button">Accepter l'invitation</a>
  
            <p>Si vous n'avez pas initié cette demande, veuillez ignorer cet email.</p>
            
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
  