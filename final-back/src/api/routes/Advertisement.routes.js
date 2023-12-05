const { upload } = require("../../middleware/files.middleware");
const { deleteAdvertisement, create, update } = require("../controllers/Advertisement.controller");

const AdvertisementRoutes = require("express").Router();

AdvertisementRoutes.post("/", upload.single("image"), create);
AdvertisementRoutes.patch("/:id", upload.single("image"), update)
AdvertisementRoutes.delete("/:id", deleteAdvertisement)

module.exports = AdvertisementRoutes
