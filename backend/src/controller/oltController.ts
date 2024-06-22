import { Request, Response, NextFunction } from "express";
import OltService from "../services/oltService";

class OltController {
  private service = new OltService();

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
      const { status, message } = await this.service.createOlt(req.body)
      res.status(status).json(message)
    } catch (error) {
      next(error)
    }

  }
}
export default OltController