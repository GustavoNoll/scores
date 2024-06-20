import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import router from './routes';
import { UniqueConstraintError } from 'sequelize';

const app = express();

app.use(express.json());
app.use(cors());
app.use(router)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {

  if (err instanceof UniqueConstraintError) {
    const errorMessage = err.errors.map((error) => ({
      message: error.message,
      type: error.type,
    }));

    return res.status(400).json({message: err.message, detail: errorMessage}); // Status 400 Bad Request pode ser mais apropriado para erros de validação
  }

  return res.status(500).json({message: err.message, detail: err})
})
export default app;

