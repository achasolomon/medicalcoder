import { Router } from 'express';
import { getDashboardOverview } from '../controllers/DashboardController';

const dashboardRouter = Router();

dashboardRouter.get('/', getDashboardOverview);

export { dashboardRouter };