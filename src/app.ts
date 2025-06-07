import express from 'express';
import dotenv from "dotenv";
import appRouter from './routes/v1';
import { errorHandler } from './middleware/error';

dotenv.config({ path: ".env" });

// Create Express server
const app = express();
app.set('port', process.env.PORT || 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1', appRouter);

app.use(errorHandler);

export default app;
