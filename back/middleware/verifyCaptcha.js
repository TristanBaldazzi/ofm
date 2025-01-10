const axios = require("axios");

const verifyCaptcha = async (req, res, next) => {
  const captchaToken = req.body.captchaToken;

  if (!captchaToken) {
    return res.status(400).json({ message: "CAPTCHA manquant." });
  }

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken,
        },
      }
    );

    if (!response.data.success) {
      return res.status(400).json({ message: "Échec du CAPTCHA." });
    }

    next();
  } catch (error) {
    console.error("Erreur lors de la vérification du CAPTCHA :", error);
    res.status(500).json({ message: "Erreur serveur lors de la vérification du CAPTCHA." });
  }
};

module.exports = verifyCaptcha;
