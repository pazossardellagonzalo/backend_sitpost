import { triggerAsyncId } from 'async_hooks';
import { model } from 'mongoose'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const commentSchema = new Schema({
    user: {
      type: String,
      required: true,
      lowercase: true
    },
    body: {
      type: String,
      required: true
    },
    postID: {
      type: String,
      required: true
    },
    datePosted: {
      type: Date
    },
    commentLikes: {
      type: [String],
      default: []
    }
})

export const Comments = model('comments', commentSchema)