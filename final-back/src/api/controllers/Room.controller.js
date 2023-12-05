const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Room = require("../models/Room.model");

//! ------------------ CREATE ------------------
const createRoom = async (req, res, next) => {
  let catchImg = req.file?.path;
  try {
    await Room.syncIndexes();
    const newRoom = new Room(req.body);
    if (req.file) {
      newRoom.image = catchImg
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


//! ------------------ GET by NAME ------------------


//! ------------------ GET ALL ------------------


//! ------------------ SORT ------------------


//! ------------------ FILTER ------------------



module.exports = {
  createRoom,

}