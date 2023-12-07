const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Room = require("../models/Room.model");
const User = require("../models/User.model");

//! ------------------ CREATE ------------------
const createRoom = async (req, res, next) => {
  let catchImg = req.files
  console.log("soy req.files", req.files)
  try {
    await Room.syncIndexes();
    const newRoom = new Room(req.body);
    if (catchImg.length > 0) {
      let a = 0
      catchImg.map((img) => {
        newRoom.image.push(catchImg[a].path)
        a++
      })
    } else {
      newRoom.image = "https://www.freeiconspng.com/thumbs/no-image-icon/no-image-icon-15.png"
    }
    const saveRoom = await newRoom.save();
    return saveRoom ? res.status(200).json(saveRoom) : res.status({ message: "Error in room creation", error})
  } catch (error) {
      if (catchImg) {
        for (let a = 0 ; a < catchImg.length ; a++) {
          deleteImgCloudinary(catchImg[a])
        }
      return res.status(500).json({
        error: 'Error en el catch',
        message: error.message,
      })
    }
  }
}

//! ------------------ UPDATE ------------------
const updateRoom = async (req, res, next) => {
  console.log("holaaa")
  await Room.syncIndexes();
  let catchImg = req.files
  console.log(catchImg)
  try {
    const { id } = req.params;
    const roomById = await Room.findById(id);
    if (roomById) {
      const oldImg = roomById.image;
      const images = []
      catchImg.map((image) => { //? como catchImg (req.files) es un array de objetos, tengo que recorrerlo y de cada objeto quedarme con el path para ser eso lo que meto en la room
        images.push(image.path)
      })

      const customBody = {
        _id: roomById._id,
        image: catchImg ? images : oldImg,
        title: req.body?.title ? req.body.title : roomById.title,
        description: req.body?.description ? req.body.description : roomById.description,
        surface: req.body?.surface ? req.body.surface : roomById.surface,
        bathroom: req.body?.bathroom ? req.body.bathroom : roomById.bathroom,
        publicLocation: req.body?.publicLocation ? req.body.publicLocation : roomById.publicLocation,
        petsAllowed: req.body?.petsAllowed ? req.body.petsAllowed : roomById.petsAllowed,
        exterior: req.body?.exterior ? req.body.exterior : roomById.exterior,
        deposit: req.body?.deposit ? req.body.deposit : roomById.deposit,
        depositPrice: req.body?.depositPrice ? req.body.depositPrice : roomById.depositPrice,
        roomates: req.body?.roomates ? req.body.roomates : roomById.roomates,
        price: req.body?.price ? req.body.price : roomById.price,
      }

      try {
        await Room.findByIdAndUpdate(id, customBody)
        if (catchImg) {
          // console.log(catchImg) //? consoles para entender qué es cada cosa
          // console.log(oldImg)
          // console.log(images)
          for (let a = 0 ; a < oldImg.length ; a++) {
            deleteImgCloudinary(oldImg[a])
          }
        }
        //!           -------------------
        //!           | RUNTIME TESTING |
        //!           -------------------

        const roomByIdUpdated = await Room.findById(id); //? ---- buscamos el elemento actualizado a través del id
        const elementUpdate = Object.keys(req.body); //? ----------- buscamos los elementos de la request para saber qué se tiene que actualizar
        let test = []; //? ----------------------------------------- objeto vacío donde meter los tests. estará compuesta de las claves de los elementos y los valores seran true/false segun haya ido bien o mal

        elementUpdate.forEach((key) => {
          //? ----------------------------- recorremos las claves de lo que se quiere actualizar
          if (req.body[key] === roomByIdUpdated[key]) {
            //? ---------- si el valor de la clave en la request (el valor actualizado que hemos pedido meter) es el mismo que el que hay ahora en el elemento ---> está bien
            test.push({ [key]: true }); //? ------------------------------------ está bien hecho por lo tanto en el test con la clave comprobada ponemos true --> test aprobado hehe
          } else {
            test.push({ [key]: false }); //? ----------------------------------- algo ha fallado y por lo tanto el test está suspendido (false)
          }
        });

        if (catchImg) {
          roomByIdUpdated.image = catchImg //? ---------------- si la imagen en la request es la misma que la que hay ahora en el elemento
            ? (test = { ...test, file: true }) //? ------------- hacemos una copia de test y le decimos que en file (foto) es true, ha ido bien
            : (test = { ...test, file: false }); //? ------------ hacemos una copia de test y le decimos que en file (foto) es false, ha ido mal
        }

        let acc = 0;
        for (let clave in test) {
          //? -------------------- recorremos tests
          test[clave] == false ? acc++ : null; //? - si el valor es false es que algo ha fallado y le sumamos al contador de fallos
        }

        if (acc > 0) {
          //? --------------------- si acc 1 o más, es que ha habido uno o más errores, y por lo tanto hay que notificarlo
          return res.status(404).json({
            dataTest: test, //? ------------ por aquí podremos examinar los errores viendo en qué claves se han producido
            update: false,
          });
        } else {
          return res.status(200).json({
            dataTest: test,
            update: true,
            updatedRoom: roomByIdUpdated,
          });
        }
      } catch (error) {
        return res.status(404).json({
          message: "there was an error saving the room",
          error: error.message,
        });
      }

    } else {
      return res.status(404).json("no matching room")
    }
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    })
  }
}

//! ------------------ DELETE ------------------
const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await Room.findByIdAndDelete(id);

    if (room) {
      try {
        //? --------------------------------------- ELIMINAMOS AL ROOM DEL USER (postedBy)
        await User.updateMany(

          { myPosts: id },
          { $pull: { myPosts: id } }, 
        );

        try {
          //? -------------------------------------- ELIMINAMOS AL ROOM DEL USER (liked)
          await User.updateMany(
            { savedRooms: id },
            { $pull: { savedRooms: id } }, 
          );
        } catch (error) {
          return res.status(500).json({
            error: "Error when deleting liked room from users",
            message: error.message,
          })
        }
      } catch (error) {
        return res.status(500).json({
          error: "Error when deleting posted room from user",
          message: error.message,
        })
      }

      const findByIdRoom = await Room.findById(id);
      return res.status(findByIdRoom ? 404 : 200).json({
        deleteTest: findByIdRoom ? false : true, 
      });
    } else {
      return res.status(404).json("the given room does not exist"); 
    }
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    })
  }
};

//! ------------------ GET by ID ------------------
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const roomById = await Room.findById(id).populate(postedBy)
    return roomById ? res.status(200).json(roomById) : res.status(404).json("we couldn't find the room")
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message
    })
  }
}

//! ------------------ GET by NAME ------------------
const getByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    const roomByName = await Room.find({ name: {$regex: name, $options: "i"}}).populate("postedBy")
    return roomByName ? res.status(200).json(roomByName) : res.status(404).json("we couldn't find the room")
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    })
  }
}

//! ------------------ GET ALL ------------------
const getAll = async (req, res, next) => {
  try {
    const allRooms = await Room.find();
    return allRooms.length > 0 ? res.status(200).json(allRooms) : res.status(404).json("there are no rooms in the db")
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message
    })
  }
}

//! ------------------ SORT ------------------
const sortRooms = async (req, res, next) => {
  try {
    const { method, value } = req.params;
    const roomsArray = await Room.find().populate("postedBy")
    switch (value) {
      case "surface":
      case "bathroom":
      case "depositPrice":
      case "roomates":
      case "price":
        if (method == "descending") {
          roomsArray.sort((a, b) => {
            return b[value] - a[value];
          })
        } else if (method == "ascending") {
          roomsArray.sort((a, b) => {
            return a[value] - b[value];
          })
        }
        break;
  
      case "likes":
        if (method == "descending") {
          roomsArray.sort((a, b) => {
            return b[value] - a[value];
          })
        } else if (method == "ascending") {
          roomsArray.sort((a, b) => {
            return a[value] - b[value];
          })
        }
  
      default:
        return res.status(404).json("The value you were trying to sort by does not exist/is not valid")
    }
    return roomsArray.length > 0 ? res.status(200).json(roomsArray) : res.status(404).json("there are no rooms in the db")
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message
    })
  }
}

//! ------------------ FILTER ------------------
const filterRooms = async (req, res, next) => {
  try {
    let roomsArray
    const { filter, min, max } = req.params;
    switch (filter) {
      case "surface":
      case "bathroom":
      case "depositValue":
      case "roomates":
      case "price":
        roomsArray = await Room.find({
          $and : [{ [filter]: {$gt: min}}, { [filter]: {$lt: max}}] //? $and concatena; filter el value que filtrar; gt es min, lt es max
        }).populate("postedBy")
        break;
    
      default:
        return res.status(404).json("The value you were trying to filter by does not exist/is not valid")
    }
    return roomsArray.length > 0 ? res.status(200).json(roomsArray) : res.status(404).json("There are no rooms matching with the given filters")
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message
    })
  }
}


module.exports = {
  createRoom,
  updateRoom,
  deleteRoom,
  getById,
  getByName,
  getAll,
  sortRooms,
  filterRooms,

}