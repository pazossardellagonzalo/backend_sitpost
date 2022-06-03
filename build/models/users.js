"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
const mongoose_1 = require("mongoose");
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
});
exports.Users = (0, mongoose_1.model)('users', userSchema);
//# sourceMappingURL=users.js.map