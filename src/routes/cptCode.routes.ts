// routes/cptCode.routes.ts
import { Router } from 'express';
import { CptCodeController } from '../controllers/CptCodeController';
import { authenticateToken, requireRole, validateRequest } from '../middleware/AuthMiddleware';
import { cptCodeSchema } from '../utils/validationSchemas';

const cptCodeRouter = Router();

cptCodeRouter.get('/counts', authenticateToken, CptCodeController.count);
cptCodeRouter.get('/', authenticateToken, CptCodeController.list);
cptCodeRouter.get('/search', authenticateToken, CptCodeController.search);
cptCodeRouter.get('/:id', authenticateToken, CptCodeController.getById);
cptCodeRouter.post(
  '/',
  authenticateToken,
  requireRole(['admin']),
  validateRequest(cptCodeSchema),
  CptCodeController.create
);
cptCodeRouter.put(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  validateRequest(cptCodeSchema),
  CptCodeController.update
);
cptCodeRouter.delete(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  CptCodeController.delete
);

export { cptCodeRouter };
