import { CptCodeService } from '../service/CptCodeService';
import { NextFunction, Request, Response } from 'express';

export class CptCodeController {
    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const cptCode = req.body;
            const id = await CptCodeService.create(cptCode);
            res.status(201).json({ message: 'CPT code created successfully', id });
        } catch (error) {
            console.error('CPT code creation error:', error);
            next(error);
        }
    }

    static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { query } = req.query;
            console.log('cpt return data', query)
            if (!query || typeof query !== 'string') {
                res.status(400).json({ message: 'Search query is required' });
                return;
            }

            const results = await CptCodeService.search(query);
            
            res.json(results);
        } catch (error) {
            console.error('CPT code search error:', error);
            next(error);
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const cptCode = await CptCodeService.getById(id);

            if (!cptCode) {
                res.status(404).json({ message: 'CPT code not found' });
                return;
            }

            res.json(cptCode);
        } catch (error) {
            console.error('CPT code fetch error:', error);
            next(error);
        }
    }

    static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const result = await CptCodeService.list(page, limit);
            res.json({
                data: result.codes,
                pagination: {
                    currentPage: page,
                    totalItems: result.total,
                    itemsPerPage: limit,
                    totalPages: Math.ceil(result.total / limit),
                },
            });
        } catch (error) {
            console.error('CPT code list error:', error);
            next(error);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const updates = req.body;
            await CptCodeService.update(id, updates);
            res.json({ message: 'CPT code updated successfully' });
        } catch (error) {
            console.error('CPT code update error:', error);
            next(error);
        }
    }

    static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const success = await CptCodeService.delete(id);

            if (!success) {
                res.status(404).json({ message: 'CPT code not found' });
                return;
            }

            res.json({ message: 'CPT code deleted successfully' });
        } catch (error) {
            console.error('CPT code deletion error:', error);
            next(error);
        }
    }

    static async count(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const count = await CptCodeService.count();
            
            res.status(200).json({
                success: true,
                count
            });
        } catch (error) {
            next(error);
        }
    }
}