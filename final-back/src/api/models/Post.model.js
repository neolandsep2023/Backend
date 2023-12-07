const citiesEnum = require('../../data/citiesEnum')


const mongoose = require('mongoose')
const Schema = mongoose.Schema;




const PostSchema = new Schema(
    {
      title: { type: String, required: true, minLength: 10, maxLength: 50},
      text: { type: String, required: true, minLength: 50, maxLength: 600 },
      image: { type: String },
      otherImage: [{type:String}],
      location: { type: String, enum: citiesEnum, required: true },
      type: { type: String, enum: ['RoomSeeker', 'RoommateSeeker'], required: true },
      preferredGender: {type: String, required: true, enum: ["female", "male", "irrelevant"]},
      preferredAge: {type: String, required: true, enum: [
        "18-25",
        "26-35",
        "36-45",
        "+45",
        "irrelevant"
      ]},
      price: {type: Number, required: true},
      deposit: {type: Boolean, required: true},
      depositPrice: {type: Number},
      author: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      room: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
      roomates: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      saved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

      comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    },
    {
      timestamps: true,
    }
  );
  const Post = mongoose.model('Post', PostSchema);
  module.exports = Post;
  

