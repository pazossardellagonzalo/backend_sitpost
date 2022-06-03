"use strict";
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
class DatoRoutes {
    constructor() {
        this.register = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { username, password, email, age, country, gender, tel } = req.body;
            yield database_1.db.connectDB();
            const dSchema = {
                username: username,
                password: password,
                email: email,
                age: age,
                country: country,
                gender: gender,
                tel: tel
            };
            const oSchema = new users_1.Users(dSchema);
            yield oSchema.save()
                .then((doc) => res.send(doc))
                .catch((err) => res.send('Error: ' + err));
            yield database_1.db.disconnectDB();
        });
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const email = req.params.email;
            const password = req.params.password;
            yield database_1.db.connectDB()
                .then((value) => __awaiter(this, void 0, void 0, function* () {
                console.log("register");
                const query = yield users_1.Users.findOne({ email: email, password: password });
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
            this._router.get('/login/:email/:password', this.login);
    }
}
const obj = new DatoRoutes();
obj.Routes();
exports.routes = obj.router;
