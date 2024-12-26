import { Request, Response, NextFunction, Router } from 'express';
import { EncounterController } from '../controllers/EncounterController';
import { authenticateToken, validateRequest } from '../middleware/AuthMiddleware';
import { encounterSchema } from '../utils/validationSchemas';

const encounterRouter = Router();

const validateSearchParams = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { query } = req.query;
  
  if (!query || typeof query !== 'string') {
    res.status(400).json({ 
      message: 'Search query is required and must be a string' 
    });
    return;
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  if (page < 1) {
    res.status(400).json({ message: 'Page must be greater than 0' });
    return;
  }

  if (limit < 1 || limit > 100) {
    res.status(400).json({ message: 'Limit must be between 1 and 100' });
    return;
  }

  req.query.page = page.toString();
  req.query.limit = limit.toString();
  
  next();
};

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
};

encounterRouter.get(
  '/search',
  authenticateToken,
  validateSearchParams,
  asyncHandler(EncounterController.searchEncounter)
);

encounterRouter.get(
  '/count',
  authenticateToken,
  asyncHandler(EncounterController.getTotalEncounters)
);

encounterRouter.get(
  '/',
  authenticateToken,
  asyncHandler(EncounterController.list)
);

encounterRouter.get(
  '/:id',
  authenticateToken,
  asyncHandler(EncounterController.getDetails)
);

encounterRouter.post(
  '/',
  authenticateToken,
  validateRequest(encounterSchema),
  asyncHandler(EncounterController.create)
);

encounterRouter.put(
  '/:id',
  authenticateToken,
  validateRequest(encounterSchema),
  asyncHandler(EncounterController.update)
);

encounterRouter.delete(
  '/:id',
  authenticateToken,
  asyncHandler(EncounterController.delete)
);

export { encounterRouter };