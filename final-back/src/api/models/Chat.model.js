const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ChatSchema = new Schema(
  {
    userOne: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, 
    userTwo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
  },
  {
    timestamps: true,
  }
);
const Chat = mongoose.model('Chat', ChatSchema); 
module.exports = Chat;

//? hay que populate.populate