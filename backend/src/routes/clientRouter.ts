import { Router } from "express";
import UserController from "../controller/clientController"


const clientRouter = Router()
const control = new UserController()

clientRouter.get('/clients', control.get.bind(control))
clientRouter.get('/clients/:integrationId', control.get.bind(control))

clientRouter.post('/clients', control.create.bind(control))
clientRouter.patch('/clients/:integrationId', control.update.bind(control))

clientRouter.get('/clients/:integrationId/weekScores', control.weekScores.bind(control))
clientRouter.get('/clients/:integrationId/mapScores', control.mapScores.bind(control))
export default clientRouter;