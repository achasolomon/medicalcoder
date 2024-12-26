import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';


interface AuthRequest extends Request {
    user?: any;
}

// Middleware to authenticate the token
export const authenticateToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];
        console.log('Authorization header:', authHeader);  // Debug log
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        // Verify and decode the access token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded; // Attach user details (like userId) to the request
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }

};

// Middleware to enforce specific roles
export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        next();
    };
};

// Middleware for validating requests using Zod schemas
export function validateRequest(schema: any) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body); // Validate request body
            next(); // If valid, proceed to next middleware or route handler
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Detailed error response
                res.status(400).json({
                    errors: error.errors.map(err => ({
                        path: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            // Handle other unexpected errors
            next(error);
        }
    };
}

// Error handler middleware
export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
};
