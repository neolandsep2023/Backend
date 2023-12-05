const bcrypt = require("bcrypt"); //? encriptamos información
const validator = require("validator"); //? validamos información
const mongoose = require("mongoose"); //? hacemos modelo
const genderEnum = require("../../data/genderEnum");
const interestsEnum = require("../../data/interestsEnum");
const rolesEnum = require("../../data/rolesEnum");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: [validator.isEmail, "Set a valid email address."],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    birthYear: {
      type: Number,
      required: true,
      trim: true,
      min: 1900,
      max: 2005,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate: [validator.isStrongPassword], //minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
    },
    gender: {
      type: String,
      enum: genderEnum,
      required: true,
    },
    role: {
      type: String,
      enum: rolesEnum,
      default: "lessee",
    },
    confirmationCode: {
      type: Number,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    image: {
      type: String,
    },
    description: {
        type: String,
        trim: true,
    },
    interests: [{
        type: String,
        enum: interestsEnum,
    }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    likedComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    savedRooms: [{type: mongoose.Schema.Types.ObjectId, ref: "Room"}],
    // chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat"}], 
    //esto son chats que tienen comentarios por otro usuario pusheado a ese mongobjeto, y comentarios
    //pusheados al mismo mongoChat del usuario loggeado
    // privateComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    myPosts: [{type: mongoose.Schema.Types.ObjectId, ref: "Post"}],
    likedPosts: [{type: mongoose.Schema.Types.ObjectId, ref: "Post"}],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next("Password hasn't been hashed; security breach.");
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
