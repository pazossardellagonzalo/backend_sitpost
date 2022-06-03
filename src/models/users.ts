import { model } from 'mongoose'
import { buffer } from 'stream/consumers';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        require: true,
    },
    userImage: {
        type: String
    },
    bio: {
        type: String
    }
})

export const Users = model('users', userSchema)