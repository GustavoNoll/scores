import { Request, Response, NextFunction } from "express";
import AcsInformService from "../services/acsInformService";

class AcsInformController {
  private service = new AcsInformService();

  async get(req: Request, res: Response, next: NextFunction){
    try {
      const { status, message } = await this.service.get(req.params)
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
export default AcsInformController