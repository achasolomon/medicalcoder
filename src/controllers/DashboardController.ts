import { DashboardService } from '../service/dashboardService';
import { Request, Response } from 'express';

export const getDashboardOverview = async (_req: Request, res: Response) => {
    try {
        const { summaryData, chartData } = await DashboardService.getOverview();
        res.json({ summaryData, chartData });
    } catch (error) {
        // Handle errors
        if (error instanceof Error) {
            res.status(500).json({
                message: 'Failed to fetch dashboard data',
                error: error.message,
            });
        } else {
            res.status(500).json({
                message: 'Failed to fetch dashboard data',
                error: String(error),
            });
        }
    }
};

