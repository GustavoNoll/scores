import { Sequelize } from "sequelize";
import * as config from "../config/database"
import 'dotenv/config'

const sequelize = new Sequelize(config);
export default sequelize;