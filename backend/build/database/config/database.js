"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
module.exports = {
    "development": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_NAME,
        "host": process.env.DB_HOST,
        "dialect": 'postgres',
    },
    "test": {
        "username": 'postgres',
        "password": 'password',
        "database": 'test',
        "host": 'localhost',
        "dialect": 'postgres',
    }
};
