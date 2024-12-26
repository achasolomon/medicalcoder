import { CptCodeModel } from '../models';
import { CptCode } from '../models/types';

export class CptCodeService {
    static async create(cptCode: CptCode): Promise<string> {
        const existing = await CptCodeModel.findByCode(cptCode.code);
        if (existing) {
            throw new Error('CPT code already exists');
        }

        const id = await CptCodeModel.create(cptCode);
        return id.toString();
    }

    static async search(query: string): Promise<CptCode[]> {
        return CptCodeModel.search(query);
    }

    static async getById(id: number): Promise<CptCode | null> {
        return CptCodeModel.findById(id);
    }

    static async list(page: number, limit: number): Promise<{ codes: CptCode[]; total: number }> {
        return CptCodeModel.list(page, limit);
    }

    static async update(id: number, updates: Partial<CptCode>): Promise<boolean> {
        const existing = await CptCodeModel.findByCode(updates.code || '');
        if (existing && existing.id !== id) {
            throw new Error('CPT code already exists');
        }

        return CptCodeModel.update(id, updates);
    }

    static async delete(id: number): Promise<boolean> {
        return CptCodeModel.delete(id);
    }

    static async count(): Promise<number> {
        return CptCodeModel.count();
    }
}