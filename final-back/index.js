
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
const RoomRoutes = require('./src/api/routes/Room.routes');
app.use("/api/v1/rooms/", RoomRoutes);


const CommentRoutes = require('./src/api/routes/Comments.routes');
app.use("/api/v1/comments/", CommentRoutes)

const PostRoutes = require('./src/api/routes/Post.routes');
app.use("/api/v1/posts/", PostRoutes)

const UserRoutes = require('./src/api/routes/User.routes');
app.use("/api/v1/users/", UserRoutes)

const ChatRoutes = require('./src/api/routes/Chat.routes');
app.use("/api/v1/chats/", ChatRoutes)


//?--------------------------------------------------------------------------
//?-----------------------Poner servidor a funcionar---------------------------------

app.listen(PORT, () => {
  console.log(`Servidor lanzado en el puerto 👌 http://localhost:${PORT}`);
});
