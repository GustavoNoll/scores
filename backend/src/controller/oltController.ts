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
      const { status, message } = await this.service.create(req.body)
      res.status(status).json(message)
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { integrationId } = req.params; // Assumindo que o integrationId vem da URL
      const { status, message } = await this.service.update(integrationId, req.body);
      res.status(status).json(message);
    } catch (error) {
      next(error);
    }
  }
}
export default OltController