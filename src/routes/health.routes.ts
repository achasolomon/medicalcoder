import { Router } from 'express';

// Create the health check router
const healthRouter = Router();

// Add the /health route for status checking
healthRouter.get('/', (_req, res) => {
  try {
    // You can add additional checks (like database status) here
    res.status(200).json({ status: 'API is running' });
  } catch (error) {
    res.status(500).json({
      status: 'API is down',
      error: 'Internal Server Error'
    });
  }
});

export { healthRouter };
