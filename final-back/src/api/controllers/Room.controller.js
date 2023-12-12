const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const enumCheck = require("../../utils/enumCheck");
const Room = require("../models/Room.model");
const User = require("../models/User.model");

//! ------------------ CREATE ------------------
const createRoom = async (req, res, next) => {
  let catchImg = req?.files ;
  console.log("soy req.files", req.files);
  console.log("soy req.user", req.user);

  try {
    await Room.syncIndexes();
    const newRoom = new Room(req.body);
    newRoom.postedBy = req.user.id;

    if (catchImg?.length > 0) {
      let a = 0;
      catchImg.forEach((img) => {
        newRoom.image.push(img.path);
        a++;
        console.log("hola");
      });
    } else {
      newRoom.image = ["https://www.freeiconspng.com/thumbs/no-image-icon/no-image-icon-15.png"];
    }

    const saveRoom = await newRoom.save();

    try {
      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { myRooms: saveRoom._id } }
      );

      console.log(saveRoom, "saveRoom");
      return res.status(200).json(saveRoom);
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({
        error: "Error updating user",
        message: error.message,
      });
    }
  } catch (error) {
    if (catchImg) {
      for (let a = 0; a < catchImg.length; a++) {
        deleteImgCloudinary(catchImg[a]);
      }
    }

    console.error("Error creating room:", error);
    return res.status(500).json({
      error: "Error creating room",
      message: error.message,
    });
  }
};

//! ------------------ UPDATE ------------------
const updateRoom = async (req, res, next) => {
  console.log("holaaa");
  await Room.syncIndexes();
  let catchImg = req.files;
  console.log(catchImg);
  try {
    const { id } = req.params;
    const roomById = await Room.findById(id);
    if (roomById) {
      const oldImg = roomById.image;
      const images = [];
      catchImg.map((image) => {
        //? como catchImg (req.files) es un array de objetos, tengo que recorrerlo y de cada objeto quedarme con el path para ser eso lo que meto en la room
        images.push(image.path);
      });

      const customBody = {
        _id: roomById._id,
        image: catchImg ? images : oldImg,
        title: req.body?.title ? req.body.title : roomById.title,
        description: req.body?.description
          ? req.body.description
          : roomById.description,
        available: req.body?.available
          ? req.body.available
          : roomById.available,
        surface: req.body?.surface ? req.body.surface : roomById.surface,
        bathroom: req.body?.bathroom ? req.body.bathroom : roomById.bathroom,
        publicLocation: req.body?.publicLocation
          ? req.body.publicLocation
          : roomById.publicLocation,
        postcode: req.body?.postcode ? req.body.postcode : roomById.postcode,
        province: req.body?.province ? req.body.province : roomById.province,
        petsAllowed: req.body?.petsAllowed
          ? req.body.petsAllowed
          : roomById.petsAllowed,
        exterior: req.body?.exterior ? req.body.exterior : roomById.exterior,
        // deposit: req.body?.deposit ? req.body.deposit : roomById.deposit,
        // depositPrice: req.body?.depositPrice ? req.body.depositPrice : roomById.depositPrice,
        roommates: req.body?.roommates ? req.body.roommates : roomById.roommates,
        // price: req.body?.price ? req.body.price : roomById.price,
      };
      //todo ------------ ENUM (type) ------------
      if (req.body?.type) {
        const resultEnum = enumCheck(type, req.body?.type); //? checkea si el valor introducido coincide con el enum (enumOk en utils) y devuelve check: true/false
        resultEnum.check
          ? req.body?.type //? ----------------------------- si check es true, coge el valor ya que es válido
          : playerById.type; //? ---------------------------- si check es false, se queda con lo que tenía ya que el valor introducido no es el correcto del enum
      }

      //todo ------------ ENUM (commoditiesHouse) ------------
      if (req.body?.commoditiesHouse) {
        const resultEnum = enumCheck(
          commoditiesHouse,
          req.body?.commoditiesHouse
        ); //? checkea si el valor introducido coincide con el enum (enumOk en utils) y devuelve check: true/false
        resultEnum.check
          ? req.body?.commoditiesHouse //? ----------------------------- si check es true, coge el valor ya que es válido
          : playerById.commoditiesHouse; //? ---------------------------- si check es false, se queda con lo que tenía ya que el valor introducido no es el correcto del enum
      }

      //todo ------------ ENUM (commoditiesRoom) ------------
      if (req.body?.commoditiesRoom) {
        const resultEnum = enumCheck(
          commoditiesRoom,
          req.body?.commoditiesRoom
        ); //? checkea si el valor introducido coincide con el enum (enumOk en utils) y devuelve check: true/false
        resultEnum.check
          ? req.body?.commoditiesRoom //? ----------------------------- si check es true, coge el valor ya que es válido
          : playerById.commoditiesRoom; //? ---------------------------- si check es false, se queda con lo que tenía ya que el valor introducido no es el correcto del enum
      }

      try {
        await Room.findByIdAndUpdate(id, customBody);
        if (catchImg) {
          // console.log(catchImg) //? consoles para entender qué es cada cosa
          // console.log(oldImg)
          // console.log(images)
          for (let a = 0; a < oldImg.length; a++) {
            deleteImgCloudinary(oldImg[a]);
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
      return res.status(404).json("no matching room");
    }
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! ------------------ DELETE ------------------
const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await Room.findByIdAndDelete(id);

    if (room) {
      try {
        //? --------------------------------------- ELIMINAMOS AL ROOM DEL USER (postedBy)
        await User.updateMany({ myPosts: id }, { $pull: { myPosts: id } });

        try {
          //? -------------------------------------- ELIMINAMOS AL ROOM DEL USER (liked)
          await User.updateMany(
            { savedRooms: id },
            { $pull: { savedRooms: id } }
          );
        } catch (error) {
          return res.status(500).json({
            error: "Error when deleting liked room from users",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(500).json({
          error: "Error when deleting posted room from user",
          message: error.message,
        });
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
    });
  }
};

//! ------------------ GET by ID ------------------
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const roomById = await Room.findById(id).populate(postedBy);
    return roomById
      ? res.status(200).json(roomById)
      : res.status(404).json("we couldn't find the room");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! ------------------ GET by NAME ------------------
const getByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    const roomByName = await Room.find({
      name: { $regex: name, $options: "i" },
    }).populate("postedBy");
    return roomByName
      ? res.status(200).json(roomByName)
      : res.status(404).json("we couldn't find the room");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! ------------------ GET by LOCATION ------------------
const getByLocation = async (req, res, next) => {
  try {
    const { location } = req.params;
    const roomByLocation = await Room.find({
      publicLocation: { $regex: location, $options: "i" },
    }).populate("postedBy");
    return roomByLocation.length > 0
      ? res.status(200).json(roomByLocation)
      : res.status(404).json("we couldn't find any rooms");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! ------------------ GET by POSTCODE ------------------
const getByPostcode = async (req, res, next) => {
  try {
    const { postcode } = req.params;
    const roomByPostcode = await Room.find({ postcode: +postcode }).populate(
      "postedBy"
    );
    return roomByPostcode.length > 0
      ? res.status(200).json(roomByPostcode)
      : res.status(404).json("we couldn't find any rooms");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! ------------------ GET by PROVINCE ------------------
const getByProvince = async (req, res, next) => {
  try {
    const { province } = req.params;
    const roomByProvince = await Room.find({ province: { $regex: province, $options: "i" } }).populate(
      "postedBy"
    );
    return roomByProvince.length > 0
      ? res.status(200).json(roomByProvince)
      : res.status(404).json("we couldn't find any rooms");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! ------------------ GET ALL ------------------
const getAll = async (req, res, next) => {
  try {
    const allRooms = await Room.find();
    return allRooms.length > 0
      ? res.status(200).json(allRooms)
      : res.status(404).json("there are no rooms in the db");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! ------------------ SORT ------------------
const sortRooms = async (req, res, next) => {
  try {
    const { method, value } = req.params;
    const roomsArray = await Room.find().populate("postedBy");
    switch (value) {
      case "surface":
      case "bathroom":
      case "depositPrice":
      case "roommates":
      case "price":
        if (method == "descending") {
          roomsArray.sort((a, b) => {
            return b[value] - a[value];
          });
        } else if (method == "ascending") {
          roomsArray.sort((a, b) => {
            return a[value] - b[value];
          });
        }
        break;

      case "likes":
        if (method == "descending") {
          roomsArray.sort((a, b) => {
            return b[value] - a[value];
          });
        } else if (method == "ascending") {
          roomsArray.sort((a, b) => {
            return a[value] - b[value];
          });
        }

      default:
        return res
          .status(404)
          .json(
            "The value you were trying to sort by does not exist/is not valid"
          );
    }
    return roomsArray.length > 0
      ? res.status(200).json(roomsArray)
      : res.status(404).json("there are no rooms in the db");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! ------------------ FILTER ------------------
const filterRooms = async (req, res, next) => {
  try {
    let roomsArray;
    const { filter, min, max } = req.params;
    switch (filter) {
      case "surface":
      case "bathroom":
      case "depositValue":
      case "roommates":
      case "price":
        roomsArray = await Room.find({
          $and: [{ [filter]: { $gt: min } }, { [filter]: { $lt: max } }], //? $and concatena; filter el value que filtrar; gt es min, lt es max
        }).populate("postedBy");
        break;

      default:
        return res
          .status(404)
          .json(
            "The value you were trying to filter by does not exist/is not valid"
          );
    }
    return roomsArray.length > 0
      ? res.status(200).json(roomsArray)
      : res
          .status(404)
          .json("There are no rooms matching with the given filters");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

//! ------------------ FILTER ENUM ------------------
const filterEnumRooms = async (req, res, next) => {
  try {
    const { filter, value } = req.params;
    const roomFinds = await Room.find({ [filter]: value }).populate("postedBy");
    const resultEnum = enumCheck(filter, value);
    switch (filter) {
      case "commoditiesRoom":
      case "commoditiesHome":
      case "housingType":
        if (!resultEnum.check) {
          return res
            .status(404)
            .json("We couldn't find matching filter values in the db");
        }
        break;
    }
    return roomFinds.length > 0
      ? res.status(200).json(roomFinds)
      : res
          .status(404)
          .json("We couldn't find any element with the given filters");
  } catch (error) {
    return res.status(500).json({
      error: "Error en el catch",
      message: error.message,
    });
  }
};

module.exports = {
  createRoom,
  updateRoom,
  deleteRoom,
  getById,
  getByName,
  getAll,
  sortRooms,
  filterRooms,
  filterEnumRooms,
  getByLocation,
  getByProvince,
  getByPostcode,
};
