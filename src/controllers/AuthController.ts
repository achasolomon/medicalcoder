import { AuthService } from '../service/AuthService';
import { NextFunction, Request, Response } from 'express';

export class AuthController {
    // Register a new user
    static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { username, email, password, role = 'user' } = req.body;
            const { token, user } = await AuthService.register(username, email, password, role);
            res.status(201).json({ message: 'User registered successfully', token, user });
        } catch (error) {
            console.error('Registration error:', error);
            next(error);
        }
    }

    // Log in a user and return JWT token
    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;
            const { token, user } = await AuthService.login(email, password);
            res.json({ message: 'Login successful', token, user });
        } catch (error) {
            console.error('Login error:', error);
            next(error);
        }
    }

    // Get user profile
    static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId; // Accessing userId from request
            const user = await AuthService.getProfile(userId);
            res.json(user);
        } catch (error) {
            console.error('Profile fetch error:', error);
            next(error);
        }
    }

    // Log out a user by invalidating the refresh token
    static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body;
            await AuthService.logout(refreshToken);  // Invalidate the refresh token
            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            console.error('Logout error:', error);
            next(error);
        }
    }

    // Refresh JWT token using refresh token
    static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body;
            const { token } = await AuthService.refreshToken(refreshToken); // Handle the refresh logic in service
            res.json({ token });
        } catch (error) {
            console.error('Refresh token error:', error);
            next(error);
        }
    }

    // Get list of users
    static async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page = 1, limit = 10 } = req.query; // Optional pagination with default values
            const usersData = await AuthService.getUserList(Number(page), Number(limit));
            res.json(usersData);
        } catch (error) {
            console.error('Error fetching user list:', error);
            next(error);
        }
    }

    // Get the total count of users
    static async getUserCount(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const totalCount = await AuthService.getUserCount();
            res.json({ total: totalCount });
        } catch (error) {
            console.error('Error fetching user count:', error);
            next(error);
        }
    }
}
