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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = require("express");
const database_1 = require("../database/database");
const users_1 = require("../models/users");
const posts_1 = require("../models/posts");
const comments_1 = require("../models/comments");
const bcrypt = __importStar(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken_1 = require("../libs/verifyToken");
const multer_1 = __importDefault(require("../libs/multer"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
class DatoRoutes {
    constructor() {
        // SignUp Function
        this.signUp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const username = req.body.username;
                const email = req.body.email;
                const password = req.body.password;
                yield database_1.db.connectDB();
                const query = yield users_1.Users.findOne({ username: username });
                const query2 = yield users_1.Users.findOne({ email: email });
                if (query) {
                    res.send('Username already exists');
                    yield database_1.db.disconnectDB();
                }
                else if (query2) {
                    res.send('Email already exists');
                    yield database_1.db.disconnectDB();
                }
                else {
                    // Encrypt Password
                    const salt = yield bcrypt.genSalt(10);
                    const hash = yield bcrypt.hash(password, salt);
                    yield database_1.db.connectDB();
                    const dSchema = {
                        username: username,
                        email: email,
                        password: hash,
                        userImage: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path,
                        bio: ""
                    };
                    const oSchema = new users_1.Users(dSchema);
                    yield oSchema.save();
                    // Token
                    const token = jsonwebtoken_1.default.sign({ _id: oSchema._id }, process.env.TOKEN_SECRET || 'tokentest');
                    res.json({ token });
                    yield database_1.db.disconnectDB();
                }
            }
            catch (err) {
                console.log(err);
                res.status(500).send('Error ' + err);
                yield database_1.db.disconnectDB();
            }
        });
        // Get Info. SignIn
        this.getLoginInfo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const pass = req.params.password;
                const username = req.params.username;
                yield database_1.db.connectDB()
                    .then((msg) => __awaiter(this, void 0, void 0, function* () {
                    const query = yield users_1.Users.findOne({ username: username });
                    const password = query === null || query === void 0 ? void 0 : query.get('password');
                    if (query != null) {
                        const validatePass = yield bcrypt.compare(pass, password);
                        if (validatePass) {
                            res.json(query);
                            yield database_1.db.disconnectDB();
                        }
                        else {
                            res.status(500).send('Wrong password');
                            yield database_1.db.disconnectDB();
                        }
                    }
                    else {
                        res.status(500).send('Wrong username');
                        yield database_1.db.disconnectDB();
                    }
                }))
                    .catch((msg) => {
                    res.send(msg);
                });
                yield database_1.db.disconnectDB();
            }
            catch (error) {
                res.send(error);
                yield database_1.db.disconnectDB();
            }
        });
        // SignIn Function
        this.signIn = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const username = req.body.username;
                const pass = req.body.password;
                yield database_1.db.connectDB();
                const query = yield users_1.Users.findOne({ username: username });
                const password = query === null || query === void 0 ? void 0 : query.get('password');
                if (query) {
                    const validatePass = yield bcrypt.compare(pass, password);
                    if (validatePass) {
                        const token = jsonwebtoken_1.default.sign({ _id: query._id }, process.env.TOKEN_SECRET || 'tokentest', {
                            expiresIn: 60 * 60 * 24
                        });
                        res.json({ token });
                        yield database_1.db.disconnectDB();
                    }
                    else {
                        res.status(500).send('Wrong password');
                        yield database_1.db.disconnectDB();
                    }
                }
                else {
                    res.status(500).send('Wrong username');
                    yield database_1.db.disconnectDB();
                }
            }
            catch (_b) {
                res.status(500).send('Something broke!');
                yield database_1.db.disconnectDB();
            }
        });
        this.editProfile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _c;
            const userI = req.params.username;
            const { bio, password } = req.body;
            const userImage = (_c = req.file) === null || _c === void 0 ? void 0 : _c.path;
            yield database_1.db.connectDB()
                .then((msg) => __awaiter(this, void 0, void 0, function* () {
                const findUser = yield users_1.Users.findOne({ username: userI });
                const photo = findUser === null || findUser === void 0 ? void 0 : findUser.get('userImage');
                if (findUser != null) {
                    if (userImage != null) {
                        yield fs_extra_1.default.unlink(path_1.default.resolve(photo));
                    }
                    if (password === null) {
                        const updatedUser = yield users_1.Users.findOneAndUpdate({
                            username: userI
                        }, {
                            userImage: userImage,
                            bio: bio
                        }, {
                            new: true,
                        });
                        res.status(200).json(updatedUser);
                    }
                    else {
                        // Encrypt Password
                        const salt = yield bcrypt.genSalt(10);
                        const hash = yield bcrypt.hash(password, salt);
                        const updatedUser = yield users_1.Users.findOneAndUpdate({
                            username: userI
                        }, {
                            userImage: userImage,
                            bio: bio,
                            password: hash
                        }, {
                            new: true,
                        });
                        res.status(200).json(updatedUser);
                    }
                }
                else {
                    return res.status(404).json('No user found');
                }
                yield database_1.db.disconnectDB();
            }))
                .catch((msg) => {
                res.send(msg);
            });
            yield database_1.db.disconnectDB();
        });
        /*private editPassword = async (req: Request, res: Response) => {
    
            const userI = req.params.username;
            const { password } = req.body;
            await db.connectDB()
            .then(async (msg) => {
                const findUser = await Users.findOne({username: userI});
                if(findUser != null) {
                    
    
                } else {
                    return res.status(404).json('No user found');
                }
                await db.disconnectDB();
    
            })
            .catch((msg) => {
    
                res.send(msg);
    
            })
            await db.disconnectDB();
        }*/
        // Profile Info Function
        this.profile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const username = req.params.username;
            yield database_1.db.connectDB()
                .then((msg) => __awaiter(this, void 0, void 0, function* () {
                const user = yield users_1.Users.findOne({ username: username });
                if (!user) {
                    return res.status(404).json('No user found');
                }
                else {
                    res.status(200).json(user);
                    yield database_1.db.disconnectDB();
                }
                yield database_1.db.disconnectDB();
            }))
                .catch((msg) => {
                res.send(msg);
            });
            yield database_1.db.disconnectDB();
        });
        // User Delete
        this.deleteUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const user = req.params.user;
            const id = req.params._id;
            yield database_1.db.connectDB();
            // Delete all Posts and User
            const userFou = yield users_1.Users.findOne({ username: user });
            const photo1 = userFou === null || userFou === void 0 ? void 0 : userFou.get('userImage');
            yield fs_extra_1.default.unlink(path_1.default.resolve(photo1));
            const userDel = yield users_1.Users.findOneAndDelete({ username: user });
            const commDel = yield comments_1.Comments.deleteMany({ user: user });
            const postUser = yield posts_1.Posts.find({ user: user });
            if (userDel != null || userDel && commDel != null) {
                for (let index = 0; index < postUser.length; index++) {
                    const element = postUser[index];
                    const photo = element === null || element === void 0 ? void 0 : element.get('image');
                    if (photo != null) {
                        yield fs_extra_1.default.unlink(path_1.default.resolve(photo));
                    }
                }
                const postDel = yield posts_1.Posts.deleteMany({ user: user });
                res.status(200).json('Correctly deleted');
            }
            else {
                res.status(500).send('Something broke!');
            }
            yield database_1.db.disconnectDB();
        });
        // Post Function
        this.Post = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _d;
            try {
                const user = req.body.user;
                const title = req.body.title;
                const body = req.body.body;
                const likeCount = 0;
                const date = new Date();
                yield database_1.db.connectDB();
                const query = yield users_1.Users.findOne({ username: user });
                if (!query) {
                    return res.status(404).json('No user found');
                }
                else {
                    const dSchema = {
                        user: user,
                        title: title,
                        body: body,
                        likeCount: likeCount,
                        datePosted: date,
                        image: (_d = req.file) === null || _d === void 0 ? void 0 : _d.path
                    };
                    const oSchema = new posts_1.Posts(dSchema);
                    yield oSchema.save();
                    res.json(oSchema);
                    yield database_1.db.disconnectDB();
                }
            }
            catch (_e) {
                res.status(500).send('Something broke!');
                yield database_1.db.disconnectDB();
            }
        });
        // Show All Posts Function
        this.allPosts = (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield database_1.db.connectDB()
                .then((msg) => __awaiter(this, void 0, void 0, function* () {
                const query = yield posts_1.Posts.find();
                res.json(query);
                yield database_1.db.disconnectDB();
            }))
                .catch((msg) => {
                res.send(msg);
            });
            yield database_1.db.disconnectDB();
        });
        // Show users profile
        this.userPosts = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const user = req.params.user;
            yield database_1.db.connectDB()
                .then((msg) => __awaiter(this, void 0, void 0, function* () {
                const query = yield posts_1.Posts.find({ user: user });
                if (query != null) {
                    res.json(query);
                }
                else {
                    res.send('User doesnt exist');
                }
            }))
                .catch((msg) => {
                res.send(msg);
            });
            yield database_1.db.disconnectDB();
        });
        // Delete Post
        this.deletePost = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = req.params._id;
            yield database_1.db.connectDB();
            // Delete all Posts and Comments
            const postDel = yield posts_1.Posts.findOneAndDelete({ _id: id });
            const photo = postDel === null || postDel === void 0 ? void 0 : postDel.get('image');
            if (postDel != null) {
                if (photo != null) {
                    yield fs_extra_1.default.unlink(path_1.default.resolve(photo));
                }
                const deleteAll = yield comments_1.Comments.deleteMany({ postID: id });
                if (deleteAll != null) {
                    res.status(200).json('Correctly deleted');
                    yield database_1.db.disconnectDB();
                }
                else {
                    res.status(200).json('Correctly deleted');
                    yield database_1.db.disconnectDB();
                }
            }
            else {
                res.status(500).send('Something broke!');
                yield database_1.db.disconnectDB();
            }
            yield database_1.db.disconnectDB();
        });
        // Post comments
        this.Comments = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.body.user;
                const body = req.body.body;
                const postID = req.body.postID;
                const date = new Date();
                yield database_1.db.connectDB();
                const query = yield users_1.Users.findOne({ username: user });
                if (!query) {
                    res.status(404).json('No user found');
                    yield database_1.db.disconnectDB();
                }
                else {
                    const query2 = yield posts_1.Posts.findById({ _id: postID });
                    if (!query2) {
                        res.status(404).json('Post not found');
                        yield database_1.db.disconnectDB();
                    }
                    else {
                        const dSchema = {
                            user: user,
                            body: body,
                            postID: postID,
                            datePosted: date
                        };
                        const oSchema = new comments_1.Comments(dSchema);
                        yield oSchema.save();
                        res.json(oSchema);
                        yield database_1.db.disconnectDB();
                    }
                }
            }
            catch (_f) {
                res.status(500).send('Something broke!');
                yield database_1.db.disconnectDB();
            }
        });
        // Show comments
        this.postComments = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const postID = req.params.postID;
            yield database_1.db.connectDB()
                .then((msg) => __awaiter(this, void 0, void 0, function* () {
                const query = yield posts_1.Posts.findById({ _id: postID });
                if (!query) {
                    return res.status(404).send('Post not found');
                }
                else {
                    const query2 = yield comments_1.Comments.find({ postID: postID });
                    res.json(query2);
                    yield database_1.db.connectDB();
                }
                yield database_1.db.connectDB();
            }))
                .catch((msg) => {
                res.send(msg);
            });
            yield database_1.db.disconnectDB();
        });
        this.deleteComment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const commentId = req.params._id;
            yield database_1.db.connectDB()
                .then((msg) => __awaiter(this, void 0, void 0, function* () {
                const query = yield comments_1.Comments.findById({ _id: commentId });
                if (!query) {
                    return res.status(404).send('Comment not found');
                }
                else {
                    const query2 = yield comments_1.Comments.findByIdAndDelete({ _id: commentId });
                    res.status(200).json('Correctly deleted');
                    yield database_1.db.connectDB();
                }
                yield database_1.db.connectDB();
            }))
                .catch((msg) => {
                res.send(msg);
            });
            yield database_1.db.disconnectDB();
        });
        // Users profiles Info Function
        this.usersProfiles = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const username = req.params.username;
            yield database_1.db.connectDB()
                .then((msg) => __awaiter(this, void 0, void 0, function* () {
                const user = yield users_1.Users.findOne({ username: username });
                if (!user) {
                    return res.status(404).json('No user found');
                }
                else {
                    res.json(user);
                    yield database_1.db.disconnectDB();
                }
                yield database_1.db.disconnectDB();
            }))
                .catch((msg) => {
                res.send(msg);
            });
            yield database_1.db.disconnectDB();
        });
        this.likePost = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userI = req.params.username;
            const id = req.params._id;
            yield database_1.db.connectDB()
                .then((msg) => __awaiter(this, void 0, void 0, function* () {
                const findUser = yield users_1.Users.findOne({ username: userI });
                if (findUser != null) {
                    const post = yield posts_1.Posts.findById({ _id: id });
                    var likes = post === null || post === void 0 ? void 0 : post.get('likes');
                    if (post != null) {
                        const index = likes.findIndex((id) => id === String(userI));
                        if (index == -1) {
                            likes.push(userI);
                        }
                        else {
                            likes.remove(userI);
                        }
                        const updatedPost = yield posts_1.Posts.findByIdAndUpdate(id, post, { new: true, });
                        res.status(200).json(updatedPost);
                    }
                    else {
                        res.status(404).json('Couldnt be liked');
                    }
                }
                else {
                    return res.status(404).json('No user found');
                }
                yield database_1.db.disconnectDB();
            }))
                .catch((msg) => {
                res.send(msg);
            });
            yield database_1.db.disconnectDB();
        });
        this.likeComment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userI = req.params.username;
            const id = req.params._id;
            yield database_1.db.connectDB()
                .then((msg) => __awaiter(this, void 0, void 0, function* () {
                const findUser = yield users_1.Users.findOne({ username: userI });
                if (findUser != null) {
                    const post = yield comments_1.Comments.findById({ _id: id });
                    var likes = post === null || post === void 0 ? void 0 : post.get('commentLikes');
                    if (post != null) {
                        const index = likes.findIndex((id) => id === String(userI));
                        if (index == -1) {
                            likes.push(userI);
                        }
                        else {
                            likes.remove(userI);
                        }
                        const updatedPost = yield comments_1.Comments.findByIdAndUpdate(id, post, { new: true, });
                        res.status(200).json(updatedPost);
                    }
                    else {
                        res.status(404).json('Couldnt be liked');
                    }
                }
                else {
                    return res.status(404).json('No user found');
                }
                yield database_1.db.disconnectDB();
            }))
                .catch((msg) => {
                res.send(msg);
            });
            yield database_1.db.disconnectDB();
        });
        this._router = (0, express_1.Router)();
    }
    get router() {
        return this._router;
    }
    Routes() {
        // User Register
        this._router.post('/signUp', multer_1.default.single('userImage'), this.signUp),
            // User Login
            this._router.get('/getLogin/:username/:password', this.getLoginInfo),
            this._router.post('/signIn', this.signIn),
            // User Profile && Edit Profile
            this._router.get('/profile/:username', verifyToken_1.tokenValidation, this.profile),
            this._router.put('/editProfile/:username', multer_1.default.single('userImage'), this.editProfile),
            // User delete
            this._router.delete('/deleteUser/:user', this.deleteUser),
            this._router.delete('/deletePost/:_id', this.deletePost),
            // Other users profiles
            this._router.get('/usersProfile/:username', this.usersProfiles),
            // Posts Creation and Show All
            this._router.post('/post', multer_1.default.single('image'), this.Post),
            this._router.get('/allPosts', this.allPosts),
            this._router.get('/userPosts/:user', this.userPosts),
            this._router.put('/likeCount/:username/:_id', this.likePost),
            // Post Comment && show comments && Delete
            this._router.post('/comment', this.Comments),
            this._router.get('/postComments/:postID', this.postComments),
            this._router.delete('/deleteComment/:_id', this.deleteComment),
            this._router.put('/likeComment/:username/:_id', this.likeComment);
    }
}
const obj = new DatoRoutes();
obj.Routes();
exports.routes = obj.router;
//# sourceMappingURL=routes.js.map