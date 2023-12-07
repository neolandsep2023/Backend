const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CommentSchema = new Schema(
  {
    rating: { type: Number, required: false, min: 0, max: 5 },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    commentedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    commentedRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    commentedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    type: {type: String, enum: ["public", "private"]}, //? solamente pueden ser privados los commentedUser. los commentedRoom/Post SIEMPRE PUBLICOS
    textComment: { type: String, unique: false, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);
const Comment = mongoose.model('Comment', CommentSchema); 
module.exports = Comment;
