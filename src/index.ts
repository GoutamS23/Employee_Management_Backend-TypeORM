
import "reflect-metadata";
import express, { Express} from "express";
import dotenv from "dotenv";
import { createConnection } from "typeorm";
import routes from './routes'
import cookieParser from 'cookie-parser';
import helmet from "helmet";


dotenv.config();


const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Establish TypeORM connection
createConnection() 
    .then(async () => {
        console.log("Connected to MongoDB database");

        app.listen(port, () => {
            console.log(`[server]: Server is running at http://localhost:${port}`);
        });
    })
    .catch(error => {
        console.error('TypeORM connection error:', error);
    });



app.use('/api/v1/auth', routes);