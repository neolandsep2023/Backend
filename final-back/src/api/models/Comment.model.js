const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CommentSchema = new Schema(
  {
    rating: { type: Number, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
 name: { type: String },
 commented: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   nameComentador: { type: String },
    image: { type: String },
   textComment: { type: String, unique: false, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);
const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;
