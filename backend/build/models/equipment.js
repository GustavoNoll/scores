"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Equipment extends sequelize_1.Model {
}
Equipment.init({
    serialNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    // Defina outros atributos aqui...
}, {
    sequelize: database_1.default,
    modelName: 'Equipment',
});
exports.default = Equipment;
