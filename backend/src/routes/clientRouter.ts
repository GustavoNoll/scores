import { Router } from "express";
import UserController from "../controller/clientController"


const clientRouter = Router()
const control = new UserController()

clientRouter.get('/clients', control.get.bind(control))
clientRouter.get('/clients/:integrationId', control.get.bind(control))

clientRouter.post('/clients', control.create.bind(control))

export default clientRouter;