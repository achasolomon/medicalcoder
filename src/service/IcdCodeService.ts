import { IcdCodeModel } from '../models';
import { IcdCode } from '../models/types';

export class IcdCodeService {
    static async create(icdCode: IcdCode): Promise<string> {
        const existing = await IcdCodeModel.findByCode(icdCode.code);
        if (existing) {
            throw new Error('ICD code already exists');
        }

        const id = await IcdCodeModel.create(icdCode);
        return id.toString();
    }

    static async search(query: string): Promise<IcdCode[]> {
        const results = await IcdCodeModel.search(query);
        console.log('Raw results from database:', results);
        return results;
    }

    static async list(page: number, limit: number): Promise<{ codes: IcdCode[]; total: number }> {
        return IcdCodeModel.list(page, limit);
    }

    static async update(id: number, updates: Partial<IcdCode>): Promise<boolean> {
        const existing = await IcdCodeModel.findByCode(updates.code || '');
        if (existing && existing.id !== id) {
            throw new Error('ICD code already exists');
        }

        return IcdCodeModel.update(id, updates);
    }

    static async getAll(): Promise<IcdCode[]> {
        const { codes } = await IcdCodeModel.list();
        return codes;
    }

    static async getById(id: number): Promise<IcdCode | null> {
        return IcdCodeModel.findById(id);
    }

    static async delete(id: number): Promise<boolean> {
        return IcdCodeModel.delete(id);
    }

    static async count(): Promise<number> {
        return IcdCodeModel.count();
    }
}