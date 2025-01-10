const jwt = require('jsonwebtoken');
const Ticket = require('../models/Ticket');

module.exports = async function (req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Accès refusé' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;

    // Vérification supplémentaire pour l'accès aux tickets
    const ticketId = req.params.id;
    if (ticketId) {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé.' });

      // Vérifie si l'utilisateur est le créateur du ticket ou un admin
      if (ticket.user.toString() !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Accès interdit.' });
      }
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};
