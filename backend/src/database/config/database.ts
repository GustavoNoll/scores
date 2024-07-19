import 'dotenv/config'
import { Options } from 'sequelize';


const config: Options = {
    "username": process.env.DB_USER || 'postgres',
    "password": process.env.DB_PASSWORD || 'password', 
    "database": process.env.NODE_ENV === 'test' ? 'test' : process.env.DB_NAME,
    "host": process.env.DB_HOST || 'localhost',
    "dialect": 'postgres',
    "logging": false,
}

export = config;