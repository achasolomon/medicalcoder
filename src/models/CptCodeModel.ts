// src/models/CptCodeModel.ts

import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db';
import { CptCode } from './types';

export class CptCodeModel {
    static async initializeTable(): Promise<void> {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS cpt_codes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(20) NOT NULL UNIQUE,
                description TEXT NOT NULL,
                category VARCHAR(50) NOT NULL,
                relative_value_unit DECIMAL(10, 2) NOT NULL
            )
        `;

        try {
            await pool.execute(createTableSQL);
            console.log("CPT Codes table initialized successfully.");
        } catch (error) {
            console.error("Error initializing CPT Codes table:", error);
            throw new Error('Database error while initializing CPT Codes table');
        }
    }


    static async create(cptCode: CptCode): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO cpt_codes (code, description, category, relative_value_unit) VALUES (?, ?, ?, ?)',
            [cptCode.code, cptCode.description, cptCode.category, cptCode.relative_value_unit]
        );
        return result.insertId;
    }

    static async findByCode(code: string): Promise<CptCode | null> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM cpt_codes WHERE code = ?',
            [code]
        );
        return rows.length ? rows[0] as CptCode : null;
    }

    static async findById(id: number): Promise<CptCode | null> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM cpt_codes WHERE id = ?',
            [id]
        );
        return rows.length ? rows[0] as CptCode : null;
    }

    static async search(query: string): Promise<CptCode[]> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM cpt_codes WHERE code LIKE ? OR description LIKE ? OR category LIKE ? LIMIT 50',
            [`%${query}%`, `%${query}%`, `%${query}%`]
        );
        return rows as CptCode[];
    }

    static async update(id: number, cptCode: Partial<CptCode>): Promise<boolean> {
        const allowedUpdates = ['code', 'description', 'category', 'relative_value_unit'];
        const updates = Object.entries(cptCode)
            .filter(([key]) => allowedUpdates.includes(key))
            .map(([key]) => `${key} = ?`);

        if (updates.length === 0) return false;

        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE cpt_codes SET ${updates.join(', ')} WHERE id = ?`,
            [...Object.values(cptCode).filter((_, index) => allowedUpdates.includes(Object.keys(cptCode)[index])), id]
        );
        return result.affectedRows > 0;
    }

    static async list(page: number = 1, limit: number = 50): Promise<{ codes: CptCode[], total: number }> {
        const offset = (page - 1) * limit;
        const [codes] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM cpt_codes LIMIT ? OFFSET ?',
            [limit, offset]
        );
        const [countResult] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM cpt_codes');
        return {
            codes: codes as CptCode[],
            total: (countResult[0] as { total: number }).total
        };
    }

    static async delete(id: number): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM cpt_codes WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
    static async count(): Promise<number> {
        const [result] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM cpt_codes');
        return (result[0] as { total: number }).total;
    }
}