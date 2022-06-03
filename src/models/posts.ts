import { model } from 'mongoose'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const postSchema = new Schema({
    user: {
        type: String,
        required: true,
        lowercase: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    likes: {
        type: [String],
        default: []
    },
    datePosted: {
        type: Date
    },
    image: {
        type: String
    }
})

export const Posts = model('posts', postSchema)