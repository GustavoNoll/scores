import { Router } from "express";
import OltController from "../controller/oltController";


const oltRouter = Router()
const control = new OltController()

oltRouter.get('/olts', control.getAll.bind(control))

oltRouter.post('/olts', control.create.bind(control))

export default oltRouter;