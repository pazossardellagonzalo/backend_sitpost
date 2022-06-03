"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const mongoose_1 = require("mongoose");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const clientSchema = new Schema({
    username: {
        type: String,
        unique: true,
        require: true
    },
    password: {
        type: String,
        unique: true,
        require: true
    },
    email: {
        type: String,
        unique: true,
        require: true,
        lowercase: true
    },
    age: {
        type: Number,
        max: 100
    },
    country: String,
    gender: String,
    tel: {
        type: Number,
        unique: true,
        maxLength: 9,
        minLength: 9
    }
});
exports.Client = (0, mongoose_1.model)('client', clientSchema);
