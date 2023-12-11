const { isAuth } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");
const { 
  createRoom,
  updateRoom,
  deleteRoom,
  getById,
  getByName,
  getAll,
  sortRooms,
  filterRooms,
  filterEnumRooms,
  getByProvince,
  getByPostcode
} = require("../controllers/Room.controller");


const RoomRoutes = require("express").Router();

RoomRoutes.post("/", upload.array("image", 10),[isAuth], createRoom);
RoomRoutes.patch("/:id", upload.array("image", 10), updateRoom);
RoomRoutes.delete("/:id", deleteRoom);
RoomRoutes.get("/:id", getById)
RoomRoutes.get("/", getAll)
RoomRoutes.get("/byName/:name", getByName)
RoomRoutes.get("/byPostcode/:postcode", getByPostcode)
RoomRoutes.get("/byProvince/:province", getByProvince)
RoomRoutes.get("/sort/rooms/:method/:value", sortRooms)
RoomRoutes.get("/filter/rooms/:filter/:min/:max", filterRooms)
RoomRoutes.get("/filter/rooms/:filter/:value", filterEnumRooms)

module.exports = RoomRoutes