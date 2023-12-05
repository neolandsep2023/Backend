const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

const conectarBd = async () => {
  try {
    const bd = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,

      useUnifiedTopology: true,
    });
    const { name, host } = bd.connection;
    console.log(
      `Conectada la Base de Datos en el Host${host} con el nombre ${name}😍 `
    );
  } catch (error) {
    console.log('No se ha podido conectar❌', error);
  }
};

module.exports = { conectarBd };
