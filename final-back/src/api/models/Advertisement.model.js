const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AdvertisementSchema = new Schema(
    {
        name: {type: String, required: true},
        image: {type: String, required: true}
    },
    {
    timestamps: true,
    },
);

const Advertisement = mongoose.model("Advertisement", AdvertisementSchema);
module.exports = Advertisement;