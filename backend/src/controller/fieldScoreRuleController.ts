import { Request, Response, NextFunction } from "express";
import FieldScoreRuleService from "../services/fieldScoreRuleService";

class FieldScoreRuleController {
  private service = new FieldScoreRuleService;

  async get(req: Request, res: Response, next: NextFunction){
    try {
      const { status, message } = await this.service.get()
      res.status(status).json(message)
    } catch (error) {
      next(error)
    }
  }

  async create(req: Request, res: Response, next: NextFunction){
    try {
      const { status, message } = await this.service.create(req.body)
      res.status(status).json(message)
    } catch (error) {
      next(error)
    }
  }
}
export default FieldScoreRuleController