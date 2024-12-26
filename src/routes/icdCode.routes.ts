// routes/icdCode.routes.ts
import { Router } from 'express';
import { IcdCodeController } from '../controllers/IcdCodeController';
import { authenticateToken, requireRole, validateRequest } from '../middleware/AuthMiddleware';
import { icdCodeSchema } from '../utils/validationSchemas';

const icdCodeRouter = Router();

icdCodeRouter.get('/counts', authenticateToken, IcdCodeController.count);
icdCodeRouter.get('/', authenticateToken, IcdCodeController.list);
icdCodeRouter.get('/search', authenticateToken, IcdCodeController.search);
icdCodeRouter.get('/:id', authenticateToken, IcdCodeController.getById);

icdCodeRouter.post(
  '/',
  authenticateToken,
  requireRole(['admin']),
  validateRequest(icdCodeSchema),
  IcdCodeController.create
);
icdCodeRouter.put(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  validateRequest(icdCodeSchema),
  IcdCodeController.update
);IcdCodeController
icdCodeRouter.delete(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  IcdCodeController.delete
);

export { icdCodeRouter };
