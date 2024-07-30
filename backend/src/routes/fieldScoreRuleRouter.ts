import { Router } from "express";
import FieldScoreRuleController from "../controller/fieldScoreRuleController";


const rulesRouter = Router()
const control = new FieldScoreRuleController()

rulesRouter.get('/fieldScoreRules', control.get.bind(control))

rulesRouter.post('/fieldScoreRules', control.create.bind(control))

export default rulesRouter;