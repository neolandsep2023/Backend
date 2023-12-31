const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const enumCheck = require("../../utils/enumCheck");
const Post = require("../models/Post.model");
const Room = require("../models/Room.model");
const User = require("../models/User.model");

//! ------------------ CREATE ------------------
const createRoom = async (req, res, next) => {
  let catchImg = req?.files;
  console.log("soy req.files", req.body);

  try {
    await Room.syncIndexes();
    const newRoom = new Room(req.body);
    newRoom.postedBy = req.user.id;

    if (catchImg?.length > 0) {
      let a = 0;
      catchImg.forEach((img) => {
        newRoom.image.push(img.path);
        a++;
      });
    } else {
      newRoom.image = [
        "https://www.freeiconspng.com/thumbs/no-image-icon/no-image-icon-15.png",
      ];
    }

    const saveRoom = await newRoom.save();

    if (req?.body?.post) {
      console.log("holaaaaa", saveRoom._id)
      try {
        await Post.findByIdAndUpdate(req?.body?.post, {
          $push: {room: saveRoom._id}
        })
      } catch (error) {
        return res.status(500).json(error.message)
      }
    }
    try {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { myRooms: saveRoom._id },
      });

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
        deleteImgCloudinary(catchImg[a].path);
      }
    }
    return res.status(500).json({
      error: "Error creating room",
      message: error.message,
    });
  }
};

//! ------------------ UPDATE ------------------
const updateRoom = async (req, res, next) => {
  await Room.syncIndexes();
  let catchImg = req?.files;
  console.log(req.files);
  try {
    const { id } = req.params;
    const roomById = await Room.findById(id);
    if (roomById) {
      const oldImg = roomById.image;
      const images = [];
      if (catchImg.length > 0) {
        catchImg.map((image) => {
          //? como catchImg (req.files) es un array de objetos, tengo que recorrerlo y de cada objeto quedarme con el path para ser eso lo que meto en la room
          images.push(image.path);
        });
      }

      const customBody = {
        _id: roomById._id,
        title: req.body?.title ? req.body.title : roomById.title,
        image: catchImg.length > 0 ? images : oldImg,
        description: req.body?.description
          ? req.body.description
          : roomById.description,
        type: roomById.type,
        available: req.body?.available
          ? JSON.parse(req.body.available)
          : roomById.available,
        surface: req.body?.surface ? req.body.surface : roomById.surface,
        bathrooms: req.body?.bathrooms
          ? req.body.bathrooms
          : roomById.bathrooms,
        publicLocation: roomById.publicLocation,
        postcode: roomById.postcode,
        province: roomById.province,
        petsAllowed: req.body?.petsAllowed
          ? JSON.parse(req.body.petsAllowed)
          : roomById.petsAllowed,
        exterior: req.body?.exterior
          ? JSON.parse(req.body.exterior)
          : roomById.exterior,
        roommates: req.body?.roommates
          ? req.body.roommates
          : roomById.roommates,
        commoditiesHome: roomById.commoditiesHome,
        commoditiesRoom: roomById.commoditiesRoom,
        postedBy: roomById.postedBy,
        likes: roomById.postedBy,
        saved: roomById.saved,
        comments: roomById.comments,
        post: roomById.post,
      };

      // //todo ------------ ENUM (type) ------------
      // if (req.body?.type) {
      //   const resultEnumType = enumCheck("housingType", req.body?.type); //? checkea si el valor introducido coincide con el enum (enumOk en utils) y devuelve check: true/false
      //   resultEnumType.check
      //     ? customBody.type = req.body?.type //? ----------------------------- si check es true, coge el valor ya que es válido
      //     : customBody.type = roomById.type; //? ---------------------------- si check es false, se queda con lo que tenía ya que el valor introducido no es el correcto del enum
      // }

      // //todo ------------ ENUM (location) ------------
      // if (req.body?.publicLocation) {
      //   const resultEnumLocation = enumCheck("publicLocation", req.body?.publicLocation); //? checkea si el valor introducido coincide con el enum (enumOk en utils) y devuelve check: true/false
      //   resultEnumLocation.check
      //     ? customBody.publicLocation = req.body?.publicLocation //? ----------------------------- si check es true, coge el valor ya que es válido
      //     : customBody.publicLocation = roomById.publicLocation; //? ---------------------------- si check es false, se queda con lo que tenía ya que el valor introducido no es el correcto del enum
      // }

      //todo ------------ ENUM (commoditiesHouse) ------------
      if (req.body?.commoditiesHome) {
        const resultEnumHome = enumCheck(
          "commoditiesHome",
          req.body?.commoditiesHome
        ); //? checkea si el valor introducido coincide con el enum (enumOk en utils) y devuelve check: true/false
        console.log("check1", resultEnumHome);
        resultEnumHome.check
          ? (customBody.commoditiesHome = req.body?.commoditiesHome) //? ----------------------------- si check es true, coge el valor ya que es válido
          : (customBody.commoditiesHome = roomById.commoditiesHome); //? ---------------------------- si check es false, se queda con lo que tenía ya que el valor introducido no es el correcto del enum
      }

      //todo ------------ ENUM (commoditiesRoom) ------------
      if (req.body?.commoditiesRoom) {
        const resultEnumRoom = enumCheck(
          "commoditiesRoom",
          req.body?.commoditiesRoom
        ); //? checkea si el valor introducido coincide con el enum (enumOk en utils) y devuelve check: true/false
        console.log("check2", resultEnumRoom);
        resultEnumRoom.check
          ? (customBody.commoditiesRoom = req.body?.commoditiesRoom) //? ----------------------------- si check es true, coge el valor ya que es válido
          : (customBody.commoditiesRoom = roomById.commoditiesRoom); //? ---------------------------- si check es false, se queda con lo que tenía ya que el valor introducido no es el correcto del enum
      }

      try {
        console.log(customBody);
        await Room.findByIdAndUpdate(id, customBody);
        if (catchImg.length > 0) {
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
        console.log("soy el updated room" + roomByIdUpdated);
        const elementUpdate = Object.keys(req.body); //? ----------- buscamos los elementos de la request para saber qué se tiene que actualizar
        let test = []; //? ----------------------------------------- objeto vacío donde meter los tests. estará compuesta de las claves de los elementos y los valores seran true/false segun haya ido bien o mal

        elementUpdate.forEach((key) => {
          if (key !== "commoditiesHome" && key !== "commoditiesRoom") {
            console.log("key", key);
            //? ----------------------------- recorremos las claves de lo que se quiere actualizar
            if (customBody[key] == roomByIdUpdated[key]) {
              //? ---------- si el valor de la clave en la request (el valor actualizado que hemos pedido meter) es el mismo que el que hay ahora en el elemento ---> está bien
              test.push({ [key]: true }); //? ------------------------------------ está bien hecho por lo tanto en el test con la clave comprobada ponemos true --> test aprobado hehe
            } else {
              test.push({ [key]: false }); //? ----------------------------------- algo ha fallado y por lo tanto el test está suspendido (false)
            }
          } else {
            let customBodyArrayToString = customBody[key].join(", ");
            let updatedArrayToString = roomByIdUpdated[key].join(", ");
            customBodyArrayToString === updatedArrayToString
              ? test.push({ [key]: true })
              : test.push({ [key]: false });
          }
        });

        if (catchImg.length > 0) {
          roomByIdUpdated.image == catchImg //? ---------------- si la imagen en la request es la misma que la que hay ahora en el elemento
            ? test.push({ file: true }) //? ------------- hacemos una copia de test y le decimos que en file (foto) es true, ha ido bien
            : test.push({ file: false }); //? ------------ hacemos una copia de test y le decimos que en file (foto) es false, ha ido mal
        }

        let acc = 0;
        for (let clave in test) {
          //? -------------------- recorremos tests
          test[clave] == false && acc++; //? - si el valor es false es que algo ha fallado y le sumamos al contador de fallos
        }

        if (acc > 0) {
          //? --------------------- si acc 1 o más, es que ha habido uno o más errores, y por lo tanto hay que notificarlo
          return res.status(404).json({
            dataTest: test, //? ------------ por aquí podremos examinar los errores viendo en qué claves se han producido
            update: false,
          });
        } else {
          console.log("chachi");
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
        await User.updateMany(
          { myRooms: id, savedRooms: id},
          {
            $pull: {
              myRooms: id,
              savedRooms: id,
            },
          }
        )
          try {
            await Post.updateMany({ room: id }, { $pull: { room: id } });
            try {
              await Comment.updateMany(
                { commentedRoom: id },
                { $pull: { commentedRoom: id } }
              );
              const postById = await Post.findById(id);
              return res.status(postById ? 404 : 200).json({
                deleteTest: postById ? false : true})
              } catch (error) {
                return res.status(500).json("Error updating Comments")
              }
            } catch (error) {
              return res.status(500).json("Error updating Posts")
            }
          } catch (error) {
            return res.status(500).json("Error updating Users")

          }
        } else {
          return res.status("Room not found!")
        }
      } catch (error) {
        return res.status(500).json("Error in general operation.")
      }
    }


//! ------------------ GET by ID ------------------
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const roomById = await Room.findById(id).populate("postedBy post");
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
      title: { $regex: name, $options: "i" },
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
    const roomByProvince = await Room.find({
      province: { $regex: province, $options: "i" },
    }).populate("postedBy");
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

/***
 * /**
 * //! ------------------ UPDATE ------------------
const updateRoom = async (req, res, next) => {
  await Room.syncIndexes();
  let catchImg = req?.files;
  try {
    const { id } = req.params;
    const roomById = await Room.findById(id);
    if (roomById) {
      const oldImg = roomById.image;
      const images = [];
      if (catchImg.length > 0) {
        catchImg.map((image) => {
          //? como catchImg (req.files) es un array de objetos, tengo que recorrerlo y de cada objeto quedarme con el path para ser eso lo que meto en la room
          images.push(image.path);
        });
      }
      console.log(req.body.postcode);

      const customBody = {
        _id: roomById._id,
        image: catchImg.length > 0 ? images : oldImg,
        title: req.body?.title ? req.body.title : roomById.title,
        description: req.body?.description
          ? req.body.description
          : roomById.description,
        type: roomById.type,
        available: req.body?.available
          ? JSON.parse(req.body.available)
          : roomById.available,
        surface: req.body?.surface ? req.body.surface : roomById.surface,
        bathrooms: req.body?.bathrooms
          ? req.body.bathrooms
          : roomById.bathrooms,
          petsAllowed: req.body?.petsAllowed
          ? JSON.parse(req.body.petsAllowed)
          : roomById.petsAllowed,
        exterior: req.body?.exterior
          ? JSON.parse(req.body.exterior)
          : roomById.exterior,
        roommates: req.body?.roommates
          ? req.body.roommates
          : roomById.roommates,
        publicLocation: roomById.publicLocation,
        province: roomById.province,
        postcode: roomById.postcode,

        commoditiesHome: req.body?.commoditiesHome
        ? req.body.commoditiesHome
        : roomById.commoditiesHome,
        commoditiesRoom: req.body?.commoditiesRoom
        ? req.body.commoditiesRoom
        : roomById.commoditiesRoom,
        roommates: req.body?.roommates
          ? req.body.roommates
          : roomById.roommates,

      
      };
      // console.log("bodyadiadiadi", customBody);

      // if (req.body?.interests) {
      //   const { interests } = req.body;   //! ES UN ARRAY
      //   let enumResult = enumCheck("interests", interests);
      //   console.log(enumResult, 'Enum result');
      //   patchedUser.interests = enumResult.check
      //     ? interests
      //     : req.user.interests;
      // }


      // //todo ------------ ENUM (commoditiesHouse) ------------
      // if (req.body?.commoditiesHouse) {
      //   const resultEnumHouse = enumCheck(
      //     "commoditiesHome",
      //     req.body?.commoditiesHome
      //   ); //? checkea si el valor introducido coincide con el enum (enumOk en utils) y devuelve check: true/false
      //   console.log(resultEnumHouse)
        
      //   resultEnumHouse.check
      //     ? (customBody.commoditiesHome = req.body?.commoditiesHome) //? ----------------------------- si check es true, coge el valor ya que es válido
      //     : (customBody.commoditiesHome = roomById.commoditiesHome); //? ---------------------------- si check es false, se queda con lo que tenía ya que el valor introducido no es el correcto del enum
      // }

      // //todo ------------ ENUM (commoditiesRoom) ------------
      // if (req.body?.commoditiesRoom) {
      //   const resultEnumRoom = enumCheck(
      //     "commoditiesRoom",
      //     req.body?.commoditiesRoom
      //   ); //? checkea si el valor introducido coincide con el enum (enumOk en utils) y devuelve check: true/false
      //   console.log(resultEnumRoom)
        
      //   resultEnumRoom.check
      //     ? (customBody.commoditiesRoom = req.body?.commoditiesRoom) //? ----------------------------- si check es true, coge el valor ya que es válido
      //     : (customBody.commoditiesRoom = roomById.commoditiesRoom); //? ---------------------------- si check es false, se queda con lo que tenía ya que el valor introducido no es el correcto del enum
      // }

      try {
        console.log(customBody);
        await Room.findByIdAndUpdate(id, customBody);
        if (catchImg) {
          for (let a = 0; a < oldImg.length; a++) {
            deleteImgCloudinary(oldImg[a]);
          }
        }


//TEEEEEEEEEEEEESTTTTTTTTTTTTTTTTTTTTTIIIIIIIIIIIIIIIIIIIIIIIIINNNNNNNNNNNNNNNNNNG
        const roomByIdUpdated = await Room.findById(id);
        console.log("soy el updated room" + roomByIdUpdated);
        const elementUpdate = Object.keys(req.body);
        let test = []; 

        elementUpdate.forEach((key) => {
          //? ----------------------------- recorremos las claves de lo que se quiere actualizar
          if (req.body[key] === roomByIdUpdated[key]) {
            test.push({ [key]: true }); 
          } else {
            test.push({ [key]: false });
          }
        });

        if (catchImg) {
          roomByIdUpdated.image = catchImg 
            ? test.push({ 'file': true }) 
            : test.push({ 'file': false });
        }

        let acc = 0;
        for (let clave in test) {
          test[clave] == false && acc++ ;
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

 */
