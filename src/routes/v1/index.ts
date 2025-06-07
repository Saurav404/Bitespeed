import { Router } from 'express';
import contactRouter from './contact';

const appRouter = Router();

// all routes
const appRoutes = [
  {
    path: '/',
    router: contactRouter,
  },
];

appRoutes.forEach(route => {
  appRouter.use(route.path, route.router);
});

export default appRouter;
