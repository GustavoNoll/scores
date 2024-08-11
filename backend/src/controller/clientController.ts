import { Request, Response, NextFunction } from "express";
import ClientService from "../services/clientService";

class ClientController {
  private service = new ClientService();

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

  async weekScores(req: Request, res: Response, next: NextFunction) {
    try {
      const { integrationId } = req.params;
      const { status, message } = await this.service.weekScores(integrationId, req.query);
      res.status(status).json(message);
    } catch (error) {
      next(error);
    }
  }

  async mapScores(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, message } = await this.service.mapLatestScores();
      res.status(status).json(message);
    } catch (error) {
      next(error);
    }
  }

}
export default ClientController