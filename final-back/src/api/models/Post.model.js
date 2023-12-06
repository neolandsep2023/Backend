const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const PostSchema = new Schema(
    {
      title: { type: String, required: true, minLength: 10, maxLength: 50},
      text: { type: String, required: true, minLength: 50, maxLength: 600 },
      image: { type: String },
      type: { type: String, enum: ['RoomSeeker', 'RoommateSeeker'], required: true },
      author: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      // authorImage: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      // authorName: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    },
    {
      timestamps: true,
    }
  );
  const Post = mongoose.model('Post', PostSchema);
  module.exports = Post;
  

