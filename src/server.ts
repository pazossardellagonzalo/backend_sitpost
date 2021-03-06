import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import path from 'path'

import { routes } from './routes/routes'

class Server {
    private app: express.Application
    constructor(){
        this.app = express()
        this.config()
        this.routes()
    }
    private async config(){

        this.app.set('port', process.env.PORT || 3000)
        this.app.use(cors())
        this.app.use(express.json())
        this.app.use(morgan('dev'))

        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*' );
            res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
            res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
            next();
        });

    }

    private routes(){
        this.app.use('/', routes);
        this.app.use('/uploads', express.static(path.resolve('uploads')));
    }
    
    start(){
        this.app.listen(this.app.get('port'), 
        () => {
            console.log(`Server on port: ${this.app.get('port')}`)
        })
    }

}

const server = new Server()
server.start()