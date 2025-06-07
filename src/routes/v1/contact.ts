import { Router } from 'express';
import { identify } from '../../controllers/contact';

const contactRouter = Router();

contactRouter.post('/identify', identify);

export default contactRouter;
