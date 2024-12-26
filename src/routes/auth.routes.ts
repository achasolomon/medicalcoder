import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken, validateRequest } from '../middleware/AuthMiddleware';
import { loginSchema, registerSchema } from '../utils/validationSchemas';


const authRouter = Router();

authRouter.get('/',  AuthController.getUsers);
authRouter.get('/count',  AuthController.getUserCount);
authRouter.post('/login', validateRequest(loginSchema), AuthController.login);
authRouter.post('/register', validateRequest(registerSchema), AuthController.register);
authRouter.post('/refresh-token', AuthController.refreshToken);
authRouter.post('/logout', authenticateToken, AuthController.logout);

export { authRouter };