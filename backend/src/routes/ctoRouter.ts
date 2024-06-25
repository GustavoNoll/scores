import { Router } from "express";
import CtoController from "../controller/ctoController";


const ctoRouter = Router()
const control = new CtoController()

ctoRouter.get('/ctos', control.get.bind(control))
ctoRouter.get('/ctos/:integrationId', control.get.bind(control))

ctoRouter.post('/ctos', control.create.bind(control))
ctoRouter.patch('/ctos/:integrationId', control.update.bind(control))

export default ctoRouter;