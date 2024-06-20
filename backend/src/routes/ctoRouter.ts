import { Router } from "express";
import CtoController from "../controller/ctoController";


const ctoRouter = Router()
const control = new CtoController()

ctoRouter.get('/ctos', control.getAll.bind(control))

ctoRouter.post('/ctos', control.create.bind(control))

export default ctoRouter;