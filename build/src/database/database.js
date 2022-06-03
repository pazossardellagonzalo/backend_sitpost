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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class DataBase {
    constructor() {
        this._Connection = `mongodb+srv://Gonzalo:DRiiyPRHs9qeQTYA@proyecto.kgdbo.mongodb.net/SitPost?retryWrites=true&w=majority`;
        this.connectDB = () => __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                yield mongoose_1.default.connect(this._Connection, {})
                    .then(() => resolve(`Connecting to ${this._Connection}`))
                    .catch((error) => reject(`Error connecting to ${this._Connection}: ${error}`));
            }));
            return promise;
        });
        this.disconnectDB = () => __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                yield mongoose_1.default.disconnect()
                    .then(() => resolve(`Disconnecting from ${this._Connection}`))
                    .catch((error) => reject(`Error disconnecting from ${this._Connection}: ${error}`));
            }));
            return promise;
        });
    }
    set Connection(_Connection) {
        this._Connection = _Connection;
    }
}
exports.db = new DataBase();
