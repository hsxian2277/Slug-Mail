const db = require('./db');
const secrets = require('./secrets.json');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const user = await db.getLogin(req.body.email, req.body.password);
  if (user) {
    res.status(200).json({email: user.email,
      name: user.name, accessToken: user.accessToken});
  } else {
    res.status(401).send('Invalid credentials');
  }
};

exports.check = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  jwt.verify(token, secrets.accessToken, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};
