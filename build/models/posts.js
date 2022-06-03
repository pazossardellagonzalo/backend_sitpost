"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Posts = void 0;
const mongoose_1 = require("mongoose");
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
});
exports.Posts = (0, mongoose_1.model)('posts', postSchema);
//# sourceMappingURL=posts.js.map