const { upload } = require("../../middleware/files.middleware");
const { 
  createRoom,
  getById,
  getByName,
  getAll,
  sortRooms,
  filterRooms
} = require("../controllers/Room.controller");


const RoomRoutes = require("express").Router();

RoomRoutes.post("/", upload.array("image", 10), createRoom)
RoomRoutes.get("/:id", getById)
RoomRoutes.get("/", getAll)
RoomRoutes.get("/byName/:name", getByName)
RoomRoutes.get("/sort/rooms/:method/:value", sortRooms)
RoomRoutes.get("/filter/rooms/:filter/:min/:max", filterRooms)

module.exports = RoomRoutes