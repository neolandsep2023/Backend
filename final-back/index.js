
//?-----------------------TRAER LIBERIAS---------------------------------
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
//?--------------------------------------------------------------------------
//?-----------------------Conectar base de datos---------------------------------
const cors = require('cors');


const { conectarBd } = require('./src/utils/db');
conectarBd();
//?--------------------------------------------------------------------------
//?-----------------------Configurar Cloudinary---------------------------------

const { configCloudinary } = require('./src/middleware/files.middleware');

configCloudinary();

//?--------------------------------------------------------------------------
//?-----------------------Traer variable de entorno PORT---------------------------------
const PORT = process.env.PORT;

//?-----------------------Crear servidor y darle las Cors---------------------------------
const app = express();
app.use(cors());
//?--------------------------------------------------------------------------
//?-----------------------Ponerle limitaciones---------------------------------

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: false }));

//?-----------------------Crear las rutas---------------------------------


//?--------------------------------------------------------------------------
//?-----------------------Poner servidor a funcionar---------------------------------

app.listen(PORT, () => {
  console.log(`Servidor lanzado en el puerto 👌 http://localhost:${PORT}`);
});

