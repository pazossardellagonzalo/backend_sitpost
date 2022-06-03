import { Request, Response, Router } from 'express'
import { db } from '../database/database'
import { Users } from '../models/users'
import { Posts } from '../models/posts'
import { Comments } from '../models/comments'
import * as bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { tokenValidation } from '../libs/verifyToken'
import { body, validationResult } from 'express-validator';
import multer from '../libs/multer'
import path from 'path'
import fs from 'fs-extra'

class DatoRoutes {
    private _router: Router

    constructor() {
        this._router = Router()
    }

    get router() {
        return this._router
    }

    // SignUp Function
    protected signUp = async (req: Request, res: Response) => {
        try {

            const username = req.body.username;
            const email = req.body.email;
            const password = req.body.password;

            await db.connectDB();
            
            const query = await Users.findOne({ username: username });
            const query2 = await Users.findOne({ email: email });
            if(query) {
                res.send('Username already exists');
                await db.disconnectDB();
            } else if (query2) {
                res.send('Email already exists');
                await db.disconnectDB();
            } else {
                // Encrypt Password
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(password, salt);
                await db.connectDB();
                const dSchema={
                    username: username,
                    email: email,
                    password: hash,
                    userImage: req.file?.path,
                    bio: ""
                };
                const oSchema = new Users(dSchema);
                await oSchema.save();
                // Token
                const token: string = jwt.sign({_id: oSchema._id}, process.env.TOKEN_SECRET || 'tokentest');
                res.json({token});
                await db.disconnectDB();
            }

        } catch (err) {

            console.log(err);
            res.status(500).send('Error ' + err);
            await db.disconnectDB();

        }
        
    }

    // Get Info. SignIn
    private getLoginInfo = async (req:Request, res: Response) => {

        try {

            const pass = req.params.password
            const username = req.params.username;
            await db.connectDB()
            .then(async (msg) => {
                const query = await Users.findOne({ username: username });
                const password = query?.get('password');
                if (query != null) {
                    const validatePass = await bcrypt.compare(pass, password);
                    if(validatePass) {
                        res.json(query);
                        await db.disconnectDB();
                    } else {
                        res.status(500).send('Wrong password');
                        await db.disconnectDB();
                    }
                } else {
                    res.status(500).send('Wrong username');
                    await db.disconnectDB();
                }
            })
            .catch((msg) => {
                res.send(msg);
            })
            await db.disconnectDB();

        } catch (error) {
            res.send(error);
            await db.disconnectDB();
        }        
    
    }

    // SignIn Function
    private signIn = async (req: Request, res: Response) => {
        try {

            const username = req.body.username;
            const pass = req.body.password;
            await db.connectDB();
                const query = await Users.findOne({username: username});
                const password = query?.get('password');
                if(query) {
                    const validatePass = await bcrypt.compare(pass, password);
                    if(validatePass) {
                        const token: string = jwt.sign({_id: query._id}, process.env.TOKEN_SECRET || 'tokentest', {
                            expiresIn: 60 * 60 * 24
                        });
                        res.json({token});
                        await db.disconnectDB();
                    }
                    else {
                        res.status(500).send('Wrong password');
                        await db.disconnectDB();
                    }
                } else {
                    res.status(500).send('Wrong username');
                    await db.disconnectDB();
                }

        } catch {

            res.status(500).send('Something broke!');
            await db.disconnectDB();

        }    
    }

    private editProfile = async (req: Request, res: Response) => {

        const userI = req.params.username;
        const {email, password, bio} = req.body;
        const userImage = req.file?.path
        await db.connectDB()
        .then(async (msg) => {
            const findUser = await Users.findOne({username: userI});
            const photo = findUser?.get('userImage');
            if(findUser != null) {
                if(userImage != null) {
                    await fs.unlink(path.resolve(photo));
                }
                // Encrypt Password
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(password, salt);
                const updatedUser = await Users.findOneAndUpdate(
                    {
                        username: userI
                    },
                    {
                        username: userI,
                        email: email,
                        password: hash,
                        userImage: userImage,
                        bio: bio    
                    },
                    { 
                        new: true,
                    });
                res.status(200).json(updatedUser);

            } else {
                return res.status(404).json('No user found');
            }
            await db.disconnectDB();

        })
        .catch((msg) => {

            res.send(msg);

        })
        await db.disconnectDB();
    }


    // Profile Info Function
    private profile = async (req: Request, res: Response) => {

        const username = req.params.username
        await db.connectDB()
        .then(async (msg) => {

            const user = await Users.findOne({username: username});
            if (!user) {
                return res.status(404).json('No user found');
            } else {
                res.status(200).json(user);
                await db.disconnectDB();
            }
            await db.disconnectDB();

        })
        .catch((msg) => {

            res.send(msg);

        })
        await db.disconnectDB();
    }

    // User Delete
    private deleteUser = async (req: Request, res: Response) => {

        const user = req.params.user;
        const id = req.params._id;
        await db.connectDB();
            // Delete all Posts and User
            const userFou = await Users.findOne({username: user});
            const photo1 = userFou?.get('userImage');
            await fs.unlink(path.resolve(photo1));
            const userDel = await Users.findOneAndDelete({ username: user })
            const commDel = await Comments.deleteMany({user: user})
            const postUser = await Posts.find({user: user})
            
            if(userDel != null || userDel && commDel != null) {
                
                for (let index = 0; index < postUser.length; index++) {
                    const element = postUser[index];
                    const photo = element?.get('image');    
                    if(photo != null) {
                        await fs.unlink(path.resolve(photo));
                    }
                }

                const postDel = await Posts.deleteMany({ user: user })
                res.status(200).json('Correctly deleted');

            } else{
                res.status(500).send('Something broke!');
            }
        await db.disconnectDB();

    }

    // Post Function
    private Post = async (req: Request, res: Response) => {
        try {

            const user = req.body.user;
            const title = req.body.title;
            const body = req.body.body;
            const likeCount = 0;
            const date = new Date();
            await db.connectDB();
            const query = await Users.findOne({username: user});
            if(!query) {
                return res.status(404).json('No user found');
            } else {
                const dSchema={
                    user: user,
                    title: title,
                    body: body,
                    likeCount: likeCount,
                    datePosted: date,
                    image: req.file?.path
                };
                const oSchema = new Posts(dSchema);
                await oSchema.save();
                res.json(oSchema);
                await db.disconnectDB();
            }

        } catch {

            res.status(500).send('Something broke!');
            await db.disconnectDB();

        }    
    }

    // Show All Posts Function
    private allPosts = async (req: Request, res: Response) => {

        await db.connectDB()
        .then(async (msg) => {

            const query = await Posts.find();
            res.json(query);
            await db.disconnectDB();

        })
        .catch((msg) => {

            res.send(msg);

        })
        await db.disconnectDB();
    }

    // Show users profile
    private userPosts = async (req: Request, res: Response) => {

        const user = req.params.user
        await db.connectDB()
        .then(async (msg) => {

            const query = await Posts.find({user: user});            
            if(query != null) {
                res.json(query);
            } else {
                res.send('User doesnt exist');
            }

        })
        .catch((msg) => {

            res.send(msg);

        })
        await db.disconnectDB();
    }

    // Delete Post
    private deletePost = async (req: Request, res: Response) => {

        const id = req.params._id
        await db.connectDB();
            // Delete all Posts and Comments
            const postDel = await Posts.findOneAndDelete({ _id: id })
            const photo = postDel?.get('image');
            if(postDel != null) {
                if(photo != null){
                    await fs.unlink(path.resolve(photo));
                }
                const deleteAll = await Comments.deleteMany({postID: id})
                if(deleteAll != null) {
                    res.status(200).json('Correctly deleted');
                    await db.disconnectDB();
                } else{
                    res.status(200).json('Correctly deleted');
                    await db.disconnectDB();
                }
            } else{
                res.status(500).send('Something broke!');
                await db.disconnectDB();
            }
        await db.disconnectDB();
    }

    // Post comments
    private Comments = async (req: Request, res: Response) => {
        try {

            const user = req.body.user;
            const body = req.body.body;
            const postID = req.body.postID;
            const date = new Date();
            await db.connectDB();
            const query = await Users.findOne({username: user});
            if(!query){
                res.status(404).json('No user found');
                await db.disconnectDB();
            } else {
                const query2 = await Posts.findById({_id: postID});
                if(!query2){
                    res.status(404).json('Post not found');
                    await db.disconnectDB();
                } else {
                    const dSchema={
                        user: user,
                        body: body,
                        postID: postID,
                        datePosted: date
                    };
                    const oSchema = new Comments(dSchema);
                    await oSchema.save();
                    res.json(oSchema);
                    await db.disconnectDB();
                }
            }

        } catch {

            res.status(500).send('Something broke!');
            await db.disconnectDB();

        }    
    }

    // Show comments
    private postComments = async (req: Request, res: Response) => {

        const postID = req.params.postID;
        await db.connectDB()
        .then(async (msg) => {
      
            const query = await Posts.findById({_id: postID});
            if(!query) {
                return res.status(404).send('Post not found');
            } else {
                const query2 = await Comments.find({postID: postID});
                res.json(query2);
                await db.connectDB();
            }
            await db.connectDB();

        })
        .catch((msg) => {

            res.send(msg);

        })
        await db.disconnectDB();
    }

    private deleteComment = async (req: Request, res: Response) => {

        const commentId = req.params._id;
        await db.connectDB()
        .then(async (msg) => {
      
            const query = await Comments.findById({_id: commentId});
            if(!query) {
                return res.status(404).send('Comment not found');
            } else {
                const query2 = await Comments.findByIdAndDelete({_id: commentId});
                res.status(200).json('Correctly deleted');
                await db.connectDB();
            }
            await db.connectDB();

        })
        .catch((msg) => {

            res.send(msg);

        })
        await db.disconnectDB();
    }

    // Users profiles Info Function
    private usersProfiles = async (req: Request, res: Response) => {

        const username = req.params.username
        await db.connectDB()
        .then(async (msg) => {

            const user = await Users.findOne({username: username});
            if (!user) {
                return res.status(404).json('No user found');
            } else {
                res.json(user) ;  
                await db.disconnectDB();
            }
            await db.disconnectDB();

        })
        .catch((msg) => {

            res.send(msg);

        })
        await db.disconnectDB();
    }

    private likePost = async (req: Request, res: Response) => {

        const userI = req.params.username;
        const id = req.params._id;
        await db.connectDB()
        .then(async (msg) => {

            const findUser = await Users.findOne({username: userI});
            if(findUser != null) {
                const post = await Posts.findById({ _id: id });
                var likes = post?.get('likes');
                if(post != null) {

                    const index = likes.findIndex((id:any) => id === String(userI));

                    if(index == -1) {
                        likes.push(userI);
                    } else {
                        likes.remove(userI);
                    }

                    const updatedPost = await Posts.findByIdAndUpdate(id, post, { new: true,});
                    res.status(200).json(updatedPost);
                } else {
                    res.status(404).json('Couldnt be liked');
                }

            } else {
                return res.status(404).json('No user found');
            }
            await db.disconnectDB();

        })
        .catch((msg) => {

            res.send(msg);

        })
        await db.disconnectDB();
    }

    private likeComment = async (req: Request, res: Response) => {

        const userI = req.params.username;
        const id = req.params._id;
        await db.connectDB()
        .then(async (msg) => {

            const findUser = await Users.findOne({username: userI});
            if(findUser != null) {
                const post = await Comments.findById({ _id: id });
                var likes = post?.get('commentLikes');
                if(post != null) {

                    const index = likes.findIndex((id:any) => id === String(userI));

                    if(index == -1) {
                        likes.push(userI);
                    } else {
                        likes.remove(userI);
                    }

                    const updatedPost = await Comments.findByIdAndUpdate(id, post, { new: true,});
                    res.status(200).json(updatedPost);
                } else {
                    res.status(404).json('Couldnt be liked');
                }

            } else {
                return res.status(404).json('No user found');
            }
            await db.disconnectDB();

        })
        .catch((msg) => {

            res.send(msg);

        })
        await db.disconnectDB();
    }
        

    Routes() {

        // User Register
        this._router.post('/signUp', multer.single('userImage'), this.signUp),

        // User Login
        this._router.get('/getLogin/:username/:password', this.getLoginInfo),
        this._router.post('/signIn', this.signIn),

        // User Profile && Edit Profile
        this._router.get('/profile/:username', tokenValidation, this.profile),
        this._router.put('/editProfile/:username', multer.single('userImage'), this.editProfile),

        // User delete
        this._router.delete('/deleteUser/:user', this.deleteUser),
        this._router.delete('/deletePost/:_id', this.deletePost),

        // Other users profiles
        this._router.get('/usersProfile/:username', this.usersProfiles),

        // Posts Creation and Show All
        this._router.post('/post', multer.single('image'), this.Post),
        this._router.get('/allPosts', this.allPosts),
        this._router.get('/userPosts/:user', this.userPosts),
        this._router.put('/likeCount/:username/:_id', this.likePost),

        // Post Comment && show comments && Delete
        this._router.post('/comment', this.Comments),
        this._router.get('/postComments/:postID', this.postComments),
        this._router.delete('/deleteComment/:_id', this.deleteComment),
        this._router.put('/likeComment/:user/:_id', this.likeComment)
    }

}

const obj = new DatoRoutes()
obj.Routes()
export const routes = obj.router