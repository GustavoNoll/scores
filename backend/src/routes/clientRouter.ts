import { Router } from "express";
import UserController from "../controller/clientController"


const clientRouter = Router()
const control = new UserController()

clientRouter.get('/clients', control.get.bind(control))
export default clientRouter;