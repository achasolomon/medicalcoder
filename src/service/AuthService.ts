import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UsersModel';
import { JwtPayload } from 'jsonwebtoken';
import { TokenModel } from '../models/TokenModel'
import {User} from '../models/types'


export class AuthService {
    // Register a new user
    static async register(
        username: string, 
        email: string, 
        password: string, 
        role: 'user' | 'admin' = 'user'
    ): Promise<{ token: string; refreshToken: string; user: { id: number; username: string; email: string; role: 'user' | 'admin' } }> {
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await UserModel.create({
            username,
            email,
            password: hashedPassword,
            role,
        });

        const token = jwt.sign(
            { userId, email, role },
            process.env.JWT_SECRET || 'wGtxPcbCbS7NiIMqAM7Ovcz7cj1WceWe',
            { expiresIn: '24h' }
        );

        const refreshToken = jwt.sign(
            { userId, email, role },
            process.env.JWT_REFRESH_SECRET || 'wGtxPcbCbS7NiIMqAM7Ovcz7cj1WceWe',
            { expiresIn: '7d' }
        );

        // Save refresh token to the database
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry
        await TokenModel.createToken(userId, refreshToken, expiresAt);

        return {
            token,
            refreshToken,
            user: { id: userId, username, email, role },
        };
    }

    // Login an existing user
    static async login(
        email: string, 
        password: string
    ): Promise<{ token: string; refreshToken: string; user: { id: number; username: string; email: string; role: 'user' | 'admin' } }> {
        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Incorrect password');
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'wGtxPcbCbS7NiIMqAM7Ovcz7cj1WceWe',
            { expiresIn: '24h' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_REFRESH_SECRET || 'wGtxPcbCbS7NiIMqAM7Ovcz7cj1WceWe',
            { expiresIn: '7d' }
        );

        // Save refresh token to the database
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry
        await TokenModel.createToken(Number(user.id), refreshToken, expiresAt);

        return {
            token,
            refreshToken,
            user: { id: Number(user.id), username: user.username, email: user.email, role: user.role },
        };
    }

    // Get user profile
    static async getProfile(userId: number): Promise<UserModel> {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    // Logout a user by invalidating the refresh token
    static async logout(refreshToken: string): Promise<void> {
        if (!refreshToken) {
            throw new Error('Refresh token is required');
        }

        // Delete refresh token from the database
        const deleted = await TokenModel.deleteToken(refreshToken);
        if (!deleted) {
            throw new Error('Invalid refresh token');
        }

        console.log('User logged out, refresh token invalidated.');
    }

    // Refresh the access token using a valid refresh token
    static async refreshToken(refreshToken: string): Promise<{ token: string }> {
        if (!refreshToken) {
            throw new Error('Refresh token is required');
        }

        // Verify the refresh token
        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'wGtxPcbCbS7NiIMqAM7Ovcz7cj1WceWe') as JwtPayload;
        } catch (error) {
            throw new Error('Invalid refresh token');
        }

        // Validate the token in the database
        const storedToken = await TokenModel.findTokenByUserId(decoded.userId, refreshToken);
        if (!storedToken || TokenModel.isTokenExpired(storedToken.expires_at)) {
            throw new Error('Invalid or expired refresh token');
        }

        // Generate a new access token
        const newToken = jwt.sign(
            { userId: decoded.userId, email: decoded.email, role: decoded.role },
            process.env.JWT_SECRET || 'wGtxPcbCbS7NiIMqAM7Ovcz7cj1WceWe',
            { expiresIn: '24h' }
        );

        return { token: newToken };
    }

    // Get a paginated list of users
    static async getUserList(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
        return UserModel.list(page, limit);
    }

    // Get the count of total users
    static async getUserCount(): Promise<number> {
        return UserModel.count();
    }
}
