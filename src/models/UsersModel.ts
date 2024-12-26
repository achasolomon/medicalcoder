
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db';
import { User } from './types';

export class UserModel {

    static async initializeTable(): Promise<void> {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;

        try {
            await pool.execute(createTableSQL);
            console.log("Users table initialized successfully.");
        } catch (error) {
            console.error("Error initializing Users table:", error);
            throw new Error('Database error while initializing Users table');
        }
    }


    static async create(user: User): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [user.username, user.email, user.password, user.role]
        );
        return result.insertId;
    }

    static async findByEmail(email: string): Promise<User | null> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows.length ? rows[0] as User : null;
    }

    static async findById(id: number): Promise<User | null> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return rows.length ? rows[0] as User : null;
    }

    static async update(id: number, user: Partial<User>): Promise<boolean> {
        const allowedUpdates = ['username', 'email', 'role'];
        const updates = Object.entries(user)
            .filter(([key]) => allowedUpdates.includes(key))
            .map(([key]) => `${key} = ?`);

        if (updates.length === 0) return false;

        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            [...Object.values(user).filter((_, index) => allowedUpdates.includes(Object.keys(user)[index])), id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id: number): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async list(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
        const offset = (page - 1) * limit;
        const [users] = await pool.execute<RowDataPacket[]>(
            'SELECT id, username, email, role, created_at, updated_at FROM users LIMIT ? OFFSET ?',
            [limit, offset]
        );
        const [countResult] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM users');
        return {
            users: users as User[],
            total: (countResult[0] as { total: number }).total
        };
    }
    static count(): Promise<number> {
        return UserModel.count(); // This assumes count is a method from Sequelize
    }
}