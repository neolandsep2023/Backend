const { createRoom } = require("../controllers/Room.controller");


const RoomRoutes = require("express").Router();

RoomRoutes.post("/", upload.array("images", 10), create)

module.exports = RoomRoutes