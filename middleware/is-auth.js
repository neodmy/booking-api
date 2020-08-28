const jwt = require('jsonwebtoken');

const { app: { secretKey } } = require('../config/default');

module.exports = (req, res, next) => {
  const isNotAuth = () => {
    req.isAuth = false;
    return next();
  };

  const authHeader = req.get('Authorization');
  if (!authHeader) isNotAuth();

  const token = authHeader.split(' ')[1];
  if (!token || token === '') isNotAuth();

  try {
    const decodedToken = jwt.verify(token, secretKey);
    if (!decodedToken) isNotAuth();

    req.isAuth = true;
    req.userId = decodedToken.userId;

    return next();
  } catch (err) {
    return isNotAuth();
  }
};
