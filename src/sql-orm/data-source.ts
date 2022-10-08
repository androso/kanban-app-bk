import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
const DB_HOST = process.env['DB_HOST']
const DB_PORT = process.env['DB_PORT']
const DB_PASSWORD = process.env['DB_PASSWORD']
const DB_USERNAME = process.env['DB_USERNAME']

export const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
		port: Number(DB_PORT),
    username: DB_USERNAME,
    password: DB_PASSWORD,
    synchronize: true,
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
})

