
import "reflect-metadata";
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { createConnection, getMongoManager, getMongoRepository } from "typeorm";
import { User } from "./entity/User";
import routes from './routes'
import cookieParser from 'cookie-parser';
import { CheckIn } from "./entity/checkIn";
// import { DataSource } from "typeorm";
import { MyDataSource } from './datasource'

dotenv.config();


const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

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




// Define routes and start the server
app.get("/", async (req: Request, res: Response) => {
    try {

        // let checkIns: CheckIn[] = [];

        // let checkIn1 = new CheckIn();
        // checkIn1.timestamp = Date.now();

        // let checkIn2 = new CheckIn();
        // checkIn2.timestamp = Date.now();

        // checkIns.push(checkIn1, checkIn2);

        // const newUser = new User();
        // newUser.firstName = "Goutam",
        //     newUser.lastName = "sau",
        //     newUser.email = "gg@gmail.com"
        // newUser.password = "pass"
        // newUser.checkIns = checkIns

        // const userRepository = getMongoRepository(User);
        // const user = await userRepository.save(newUser);


        // const manager = getMongoManager()
        // const user = await manager.find(User, {
        //     relations: {
        //         checkIns: true
        //     }
        // })


        const newUser = new User();
        newUser.firstName = "John";
        newUser.lastName = "Doe";
        newUser.email = "john@example.com";
        newUser.password = "password";

        // Creating multiple CheckIn entities
        const checkIn1 = new CheckIn();
        const checkIn2 = new CheckIn();

        // Add them to the checkIns array
        newUser.checkIns = [checkIn1, checkIn2];

        // Save the user entity
        await MyDataSource.manager.save(newUser);


        res.json({ newUser })

    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).send("Internal Server Error");
    }
});


app.use('/api/v1/auth', routes);