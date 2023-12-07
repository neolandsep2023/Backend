const mongoose = require("mongoose") 
const Schema = mongoose.Schema;
const RoomSchema = new Schema(    
  {
    title: {type: String, required: true, trim: true, maxLength: 100},
    description: {type: String, required: true, minLength: 50, maxLength: 300},
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
    available: {type: Date, required: true},
    // preferredGender: {type: String, required: true, enum: ["female", "male", "irrelevant"]},
    // preferredAge: {type: String, required: true, enum: [
    //   "18-25",
    //   "26-35",
    //   "36-45",
    //   "+45",
    //   "irrelevant"
    // ]},

    surface: {type: Number, required: true},
    bathroom: {type: Boolean, required: true},
    publicLocation: {type: String, required: true},
    postcode: {type: Number, required: true},
    petsAllowed: {type: Boolean, required: true},
    exterior: {type: Boolean, required: true},
    // deposit: {type: Boolean, required: true},
    // depositPrice: {type: Number},
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
    // price: {type: Number, required: true},
    postedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    saved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
    image: [{type: String}]
  },
  {
    timestamps: true,
  }
)
const Room = mongoose.model("Room", RoomSchema);
module.exports = Room