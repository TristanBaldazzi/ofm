const Company = require('../models/Company');

const checkAccessCompany = async (req, res, next) => {
    const companyId = req.body.companyId || req.params.companyId;
    // Récupérer companyId depuis le corps ou les paramètres

  try {
    const company = await Company.findById(companyId);
    // console.log(req);
    if (!company) {
      return res.status(404).json({ message: "Entreprise non trouvée." });
    }

    const isOwner = company.userId.toString() === req.user.id;
    const isMember = company.members.some(member => member.toString() === req.user.id);

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Accès refusé : Vous n'êtes ni propriétaire ni membre de cette entreprise." });
    }

    req.company = company; // Ajouter l'entreprise au req pour un accès ultérieur
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = checkAccessCompany;
