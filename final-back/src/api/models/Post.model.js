const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const PostSchema = new Schema(
    {
      text: { type: String, required: true },
      image: { type: String, required: true },
      type: { type: String, enum: ['Room Seeker', 'Roommate Seeker'], required: true },
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
  