import mongoose from 'mongoose';

class DataBase {

    private _Connection: string = 'mongodb+srv://gonzalo:abc@sitpost.mtaer.mongodb.net/DataBase?retryWrites=true&w=majority'
    
    constructor(){
    }
    set Connection(Connection: string){
        this._Connection = Connection
    }

    connectDB = async () => {
        const promise = new Promise<string>( async (resolve, reject) => {
            await mongoose.connect(this._Connection, {
            })
            .then( () => resolve(`Connecting to ${this._Connection}`) )
            .catch( (error) => reject(`Error connecting to ${this._Connection}: ${error}`) ) 
        })
        return promise

    }

    disconnectDB = async () => {
        const promise = new Promise<string>( async (resolve, reject) => {
            await mongoose.disconnect() 
            .then( () => resolve(`Disconnecting from ${this._Connection}`) )
            .catch( (error) => reject(`Error disconnecting from ${this._Connection}: ${error}`) )
        })
        return promise
    }

}
export const db = new DataBase()