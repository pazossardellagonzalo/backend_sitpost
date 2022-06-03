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
const Client_1 = require("../models/Client");
class DatoRoutes {
    constructor() {
        this.getClient = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const password = req.params.password;
            const email = req.params.email;
            yield database_1.db.connectDB()
                .then((msg) => __awaiter(this, void 0, void 0, function* () {
                const query = yield Client_1.Client.findOne({ email: email, password: password });
                res.json(query);
            }))
                .catch((msg) => {
                res.send(msg);
            });
            yield database_1.db.disconnectDB();
        });
        this.getClients = (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield database_1.db.connectDB()
                .then((msg) => __awaiter(this, void 0, void 0, function* () {
                const query = yield Client_1.Client.find({});
                res.json(query);
            }))
                .catch((msg) => {
                res.send(msg);
            });
            yield database_1.db.disconnectDB();
        });
        this.postClient = (req, res) => __awaiter(this, void 0, void 0, function* () {
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
            const oSchema = new Client_1.Client(dSchema);
            yield oSchema.save()
                .then((doc) => res.send(doc))
                .catch((err) => res.send('Error: ' + err));
            yield database_1.db.disconnectDB();
        });
        this.putClient = (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield database_1.db
                .connectDB()
                .then((msg) => __awaiter(this, void 0, void 0, function* () {
                const { email } = req.params;
                const { username, password, age, country, gender, tel } = req.body;
                yield Client_1.Client.findOneAndUpdate({
                    email: email,
                }, {
                    username: username,
                    password: password,
                    email: email,
                    age: age,
                    country: country,
                    gender: gender,
                    tel: tel
                }, {
                    new: true,
                })
                    .then((docu) => res.send(docu))
                    .catch((fail) => res.send(fail));
            }))
                .catch((msg) => {
                res.send(msg);
            });
            database_1.db.disconnectDB();
        });
        this.deleteClient = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const email = req.params.email;
            yield database_1.db.connectDB();
            yield Client_1.Client.findOneAndDelete({ email: email })
                .then((doc) => res.send('Deleted correctly'))
                .catch((err) => res.send('Error: ' + err));
            yield database_1.db.disconnectDB();
        });
        this._router = (0, express_1.Router)();
    }
    get router() {
        return this._router;
    }
    Routes() {
        this._router.get('/getClient/:email/:password', this.getClient),
            this._router.get('/getClients', this.getClients),
            this._router.post('/postClient', this.postClient),
            this._router.put("/putClient/:email", this.putClient),
            this._router.delete("/delClient/:email", this.deleteClient);
    }
}
const obj = new DatoRoutes();
obj.Routes();
exports.routes = obj.router;
