import { Router } from "express";
import OltController from "../controller/oltController";


const oltRouter = Router()
const control = new OltController()

oltRouter.get('/olts/averageScore', control.averageScore.bind(control))
oltRouter.get('/olts', control.get.bind(control))
oltRouter.get('/olts/:integrationId', control.get.bind(control))

oltRouter.post('/olts', control.create.bind(control))
oltRouter.patch('/olts/:integrationId', control.update.bind(control))

export default oltRouter;