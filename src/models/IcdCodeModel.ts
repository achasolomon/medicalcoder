// src/models/IcdCodeModel.ts

import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db';
import { IcdCode } from './types';

export class IcdCodeModel {



    static async initializeTable(): Promise<void> {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS icd_codes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(20) NOT NULL UNIQUE,
                description TEXT NOT NULL,
                category VARCHAR(50) NOT NULL,
                sub_category VARCHAR(50) NOT NULL
            )
        `;

        try {
            await pool.execute(createTableSQL);
            console.log("ICD Codes table initialized successfully.");
        } catch (error) {
            console.error("Error initializing ICD Codes table:", error);
            throw new Error('Database error while initializing ICD Codes table');
        }
    }
    // Create a new ICD code
    static async create(icdCode: IcdCode): Promise<number> {
        try {
            const [result] = await pool.execute<ResultSetHeader>(
                'INSERT INTO icd_codes (code, description, category, sub_category) VALUES (?, ?, ?, ?)',
                [icdCode.code, icdCode.description, icdCode.category, icdCode.sub_category]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating ICD code:', error);
            throw new Error('Database operation failed');
        }
    }

    // Find an ICD code by its code
    static async findByCode(code: string): Promise<IcdCode | null> {
        try {
            const [rows] = await pool.execute<RowDataPacket[]>(
                'SELECT * FROM icd_codes WHERE code = ?',
                [code]
            );
            return rows.length ? (rows[0] as IcdCode) : null;
        } catch (error) {
            console.error('Error finding ICD code by code:', error);
            throw new Error('Database operation failed');
        }
    }

    // Find an ICD code by its ID
    static async findById(id: number): Promise<IcdCode | null> {
        try {
            const [rows] = await pool.execute<RowDataPacket[]>(
                'SELECT * FROM icd_codes WHERE id = ?',
                [id]
            );
            return rows.length ? (rows[0] as IcdCode) : null;
        } catch (error) {
            console.error('Error finding ICD code by ID:', error);
            throw new Error('Database operation failed');
        }
    }

    // Search for ICD codes based on a query
    static async search(query: string): Promise<IcdCode[]> {
        try {
            const [rows] = await pool.execute<RowDataPacket[]>(
                'SELECT * FROM icd_codes WHERE code LIKE ? OR description LIKE ? OR category LIKE ? LIMIT 50',
                [`%${query}%`, `%${query}%`, `%${query}%`]
            );
            console.log('Raw database results:', rows);
            return rows as IcdCode[];
        } catch (error) {
            console.error('Database error in service:', error);
            throw new Error('Database operation failed');
        }
    }
    // Update an existing ICD code
    static async update(id: number, icdCode: Partial<IcdCode>): Promise<boolean> {
        const allowedUpdates = ['code', 'description', 'category', 'sub_category'];
        const updates = Object.entries(icdCode)
            .filter(([key]) => allowedUpdates.includes(key))
            .map(([key]) => `${key} = ?`);

        if (updates.length === 0) return false;

        try {
            const [result] = await pool.execute<ResultSetHeader>(
                `UPDATE icd_codes SET ${updates.join(', ')} WHERE id = ?`,
                [...Object.values(icdCode).filter((_, index) => allowedUpdates.includes(Object.keys(icdCode)[index])), id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating ICD code:', error);
            throw new Error('Database operation failed');
        }
    }

    // List ICD codes with pagination
    static async list(page: number = 1, limit: number = 50): Promise<{ codes: IcdCode[], total: number }> {
        const offset = (page - 1) * limit;
        try {
            const [codes] = await pool.execute<RowDataPacket[]>(
                'SELECT * FROM icd_codes LIMIT ? OFFSET ?',
                [limit, offset]
            );
            const [countResult] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM icd_codes');
            return {
                codes: codes as IcdCode[],
                total: (countResult[0] as { total: number }).total
            };
        } catch (error) {
            console.error('Error listing ICD codes:', error);
            throw new Error('Database operation failed');
        }
    }

    // Delete an ICD code by its ID
    static async delete(id: number): Promise<boolean> {
        try {
            const [result] = await pool.execute<ResultSetHeader>(
                'DELETE FROM icd_codes WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting ICD code:', error);
            throw new Error('Database operation failed');
        }
    }
      static async count(): Promise<number> {
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM icd_codes');
        return rows[0].total;
    }
}
