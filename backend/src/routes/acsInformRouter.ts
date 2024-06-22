import { Router } from "express";
import AcsInformController from "../controller/acsInformController"


const acsInformRouter = Router()
const control = new AcsInformController()

acsInformRouter.get('/acsInforms', control.get.bind(control))
acsInformRouter.get('/acsInforms/:deviceTag', control.get.bind(control))

acsInformRouter.post('/acsInforms', control.create.bind(control))

export default acsInformRouter;