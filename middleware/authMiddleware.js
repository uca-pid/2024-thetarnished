const jwt = require('jsonwebtoken');

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return res.status(403).json({ message: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_AUTH_SECRET, (err, user) => {
        if (err) {

          return res.status(403).json({ message: 'Invalid token provided' });
        
        }
        if (!allowedRoles.includes(user.role)) {

          return res.status(403).json({ message: 'Access Forbidden: Insufficient Permission' });
        
        }
        req.user = user;
        next();
    })
  }};

module.exports = authorizeRoles;