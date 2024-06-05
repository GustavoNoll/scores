import { Request, Response, NextFunction } from "express";
import ClientService from "../services/clientService";

class ClientController {
  private service = new ClientService();

  async get(req: Request, res: Response, next: NextFunction){
    try {
      const { status, message } = await this.service.get()
      res.status(status).json(message)
    } catch (error) {
      next(error)
    }
  }
}
export default ClientController