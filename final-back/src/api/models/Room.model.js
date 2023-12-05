const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const RoomSchema = new Schema(
  {
    title: {type: String, required: true, trim: true},
    description: {type: String, required: true},
    type: {type: String, required: true, enum: [
      "Apartment",
      "House",
      "Condo",
      "Townhouse",
      "Studio",
      "Loft",
      "Duplex",
      "Flat",
    ]},
    surface: {type: Number, required: true},
    bathroom: {type: Boolean, required: true},
    publicLocation: {type: String, required: true},
    petsAllowed: {type: Boolean, required: true},
    exterior: {type: Boolean, required: true},
    deposit: {type: Boolean, required: true},
    depositPrice: {type: Number},
    roomates: {type: Number, required: true},
    commoditiesRoom: {type: String, required: true, enum: [
      "Furnished",
      "Single Bed",
      "Double Bed",
      "Private Bathroom",
      "Balcony",
      "Natural Light",
      "Working Space",  
    ]},
    commoditiesHome: {type: String, required: true, enum: [
      "Appliances Included",
      "Living Room",
      "Dining Room",
      "Shower",
      "Bathtub",
      "Kitchen",
      "Refrigerator",
      "Oven Stove",
      "Microwave",
      "Heating",
      "Air Conditioning",
      "Internet Wi-Fi",
      "Cable Satellite TV",
      "Washer",
      "Dryer",
      "Garage",
      "Security System",
      "Balcony Patio",
      "Garden Yard",
      "Wheelchair Accessible",
      "Elevator",
      "Pet Friendly",
      "Smoking Allowed",
      "Fitness Center",
      "Pool",      
    ]},
    price: {type: Number, required: true},
    postedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    image: [{type: String}]
  },
  {
    timestamps: true,
  }
)
const Room = mongoose.model("Room", RoomSchema);
module.exports = Room