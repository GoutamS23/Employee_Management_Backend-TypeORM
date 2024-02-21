import { DataSource } from "typeorm";

export const MyDataSource = new DataSource({
    "type": "mongodb",
    "host": "localhost",
    "port": 27017,
    "database": "My_DB",
    "useNewUrlParser": true,
    "synchronize":true,
    "entities": ["src/entity/*.ts"],
})

MyDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");

        
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })