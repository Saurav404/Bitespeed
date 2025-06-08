import { Request, NextFunction, Response } from 'express';
import { handleIdentify } from '../services/contactService';

export const identify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phoneNumber } = req.body;
    const data = await handleIdentify(email, phoneNumber);
    res.status(200).json({ data: data });
  } catch (err) {
    next(err);
  }
};
