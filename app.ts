import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mainRouter from './src/routes';
import { errorHandler } from './src/middleware/AuthMiddleware';
import pool from './src/config/db';
import { UserModel, CptCodeModel, EncounterModel, IcdCodeModel, TokenModel, } from './src/models';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize the Users table and other tables
async function initializeDatabase() {
    try {
        await Promise.all([
            UserModel.initializeTable(),
            CptCodeModel.initializeTable(),
            EncounterModel.initializeTable(),
            IcdCodeModel.initializeTable(),
            TokenModel.initializedTable(),
        ]);
        console.log('Database tables initialized successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Routes
app.use('/api', mainRouter);

// Error handling
app.use(errorHandler);

// Handle undefined routes (404)
app.use((_, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Graceful shutdown
const shutdown = async () => {
    try {
        console.log('Shutting down gracefully...');
        await pool.end(); // Close the database pool
        console.log('Database connection pool closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// DB Connection and Server Start
const startServer = async () => {
    try {
        await initializeDatabase();
        const connection = await pool.getConnection();
        connection.release(); // Test database connection
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
