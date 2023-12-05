const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Room = require("../models/Room.model");

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
    req.file?.path && deleteImgCloudinary(catchImg)
    return res.status(500).json({
      error: 'Error en el catch',
      message: error.message,
    })
  }
}

//! ------------------ UPDATE ------------------
const updateRoom = async (req, res, next) => {
  await Room.syncIndexes();
  let catchImg = req.files
}

//! ------------------ DELETE ------------------


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
        if (method == descending) {
          roomsArray.sort((a, b) => {
            return b[value] - a[value];
          })
        } else if (method == ascending) {
          roomsArray.sort((a, b) => {
            return a[value] - b[value];
          })
        }
        break;
  
      case "likes":
        if (method == descending) {
          roomsArray.sort((a, b) => {
            return b[value] - a[value];
          })
        } else if (method == ascending) {
          roomsArray.sort((a, b) => {
            return a[value] - b[value];
          })
        }
  
      default:
        return res.status(404).json("The value you were trying to sort by does not exist/is not valid")
    }
    return roomsArray.length > 0 ? res.status(200).json(roomsArray) : res.status(404).json("there are no rooms in the db")
  } catch (error) {
    return res.staus(500).json({
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
          $and : [{ [filter]: {$gt: min}}, { [filter]: {lt: max}}] //? $and concatena; filter el value que filtrar; gt es min, lt es max
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
  getById,
  getByName,
  getAll,
  sortRooms,
  filterRooms
}