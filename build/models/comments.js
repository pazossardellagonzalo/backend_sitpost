"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comments = void 0;
const mongoose_1 = require("mongoose");
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
});
exports.Comments = (0, mongoose_1.model)('comments', commentSchema);
//# sourceMappingURL=comments.js.map