import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// TokenModel Class to handle token-related database operations
export class TokenModel {
    // Function to create the tokens table if it doesn't exist
    static async initializedTable(): Promise<void> {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                token VARCHAR(255) NOT NULL UNIQUE,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;

        try {
            await pool.execute(createTableSQL);
            console.log('Tokens table initialized successfully.');
        } catch (error) {
            console.error('Error initializing tokens table:', error);
            throw error;
        }
    }

    // Function to create a new token for a user
    static async createToken(userId: number, token: string, expiresAt: Date): Promise<ResultSetHeader> {
        try {
            const query = 'INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, ?)';
            const [result] = await pool.execute(query, [userId, token, expiresAt]);
            return result as ResultSetHeader;
        } catch (error) {
            console.error('Error creating token:', error);
            throw error;
        }
    }

    // Function to find a token by user ID
    static async findTokenByUserId(userId: number, token: string): Promise<RowDataPacket | null> {
        try {
            const cleanToken = token.replace('"', ''); // Clean token if necessary
            const query = `
                SELECT * FROM tokens 
                WHERE user_id = ? AND token = ? AND expires_at > NOW() 
                ORDER BY created_at DESC 
                LIMIT 1
            `;
            const [rows] = await pool.execute(query, [userId, cleanToken]);

            const row = (rows as RowDataPacket[])[0]; // Access the first row from the result

            if (!row) {
                console.log('No token found for user:', userId);
                return null;
            }

            console.log('Token found:', row);
            return row;
        } catch (error) {
            console.error('Error finding token:', error);
            throw error;
        }
    }

    // Function to check if a token is expired
    static isTokenExpired(expiresAt: Date): boolean {
        return new Date() > new Date(expiresAt); // Check if the current date is after the expiry date
    }

    // Function to delete a token from the database
    static async deleteToken(refreshToken: string): Promise<boolean> {
        try {
            const query = 'DELETE FROM tokens WHERE token = ?';
            const [result] = await pool.execute(query, [refreshToken]);

            const resultSetHeader = result as ResultSetHeader;
            return resultSetHeader.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting token:', error);
            throw error;
        }
    }

    
}
