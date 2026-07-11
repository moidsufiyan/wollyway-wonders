import 'express';
import { IUser } from '../models/user.model.js';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: IUser;
    }
  }
}
