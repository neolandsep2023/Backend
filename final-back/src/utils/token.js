const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateToken = (id, email) => {
  if (!id || !email) {
    throw new Error('Email o id no encontrados');
  }

  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const verifyToken = (token) => {
  if (!token) throw new Error('Token no encontrado');

  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
