import { Router } from "express";
import UserController from "../controller/clientController"


const clientRouter = Router()
const control = new UserController()

clientRouter.get('/clients', control.getAll.bind(control))

clientRouter.post('/clients', control.create.bind(control))

export default clientRouter;