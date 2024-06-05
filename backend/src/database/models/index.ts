import { Sequelize } from "sequelize";
import * as config from "../config/database"
import 'dotenv/config'

export default new Sequelize(config);