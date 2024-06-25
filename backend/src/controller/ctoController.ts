import { Request, Response, NextFunction } from "express";
import CtoService from "../services/ctoService";

class CtoController {
  private service = new CtoService();

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
      const { integrationId } = req.params;
      const { status, message } = await this.service.update(integrationId, req.body);
      res.status(status).json(message);
    } catch (error) {
      next(error);
    }
  }
}
export default CtoController