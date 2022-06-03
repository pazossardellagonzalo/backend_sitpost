"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = require("express");
const database_1 = require("../database/database");
const users_1 = require("../models/users");
const bcrypt = __importStar(require("bcrypt"));
class DatoRoutes {
    constructor() {
        this.register = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { username, email, password } = req.body;
            const hash = bcrypt.hash(password, 10);
            yield database_1.db.connectDB();
            const dSchema = {
                username: username,
                email: email,
                password: hash
            };
            const oSchema = new users_1.Users(dSchema);
            yield oSchema.save()
                .then((doc) => res.send(doc))
                .catch((err) => res.send('Error: ' + err));
            yield database_1.db.disconnectDB();
        });
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const username = req.params.username;
            const password = req.params.password;
            yield database_1.db.connectDB()
                .then((value) => __awaiter(this, void 0, void 0, function* () {
                console.log("register");
                const query = yield users_1.Users.findOne({ username: username, password: password });
                console.log();
                console.log(query);
                res.json(query);
            }))
                .catch((value) => {
                res.send(value);
            });
            yield database_1.db.disconnectDB();
        });
        this._router = (0, express_1.Router)();
    }
    get router() {
        return this._router;
    }
    Routes() {
        this._router.post('/register', this.register),
            this._router.get('/login/:username/:password', this.login);
    }
}
const obj = new DatoRoutes();
obj.Routes();
exports.routes = obj.router;
