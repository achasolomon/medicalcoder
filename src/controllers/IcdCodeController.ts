import { IcdCodeService } from '../service/IcdCodeService';
import { NextFunction, Request, Response } from 'express';

export class IcdCodeController {
    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const icdCode = req.body;
            const id = await IcdCodeService.create(icdCode);
            res.status(201).json({ message: 'ICD code created successfully', id });
        } catch (error) {
            console.error('ICD code creation error:', error);
            next(error);
        }
    }
    static async search(req: Request, res: Response): Promise<void> {
        try {
            const { query } = req.query;

            if (!query || typeof query !== 'string') {
                res.status(400).json({ message: 'Search query is required' });
                return;
            }

            console.log('Query parameter received:', query);

            const results = await IcdCodeService.search(query);

            console.log('Results from service:', results);

            if (results.length === 0) {
                res.status(404).json({ message: `No ICD code found for query "${query}"` });
                return;
            }

            res.json(results);
        } catch (error) {
            console.error('ICD code search error:', error);
            res.status(500).json({ message: 'Error searching ICD codes' });
        }
    }


    static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const result = await IcdCodeService.list(page, limit);
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
            console.error('ICD code list error:', error);
            next(error);
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const updates = req.body;
            await IcdCodeService.update(id, updates);
            res.json({ message: 'ICD code updated successfully' });
        } catch (error) {
            console.error('ICD code update error:', error);
            res.status(500).json({ message: 'Error updating ICD code' });
        }
    }

    static async getAll(_req: Request, res: Response): Promise<void> {
        try {
            const icdCodes = await IcdCodeService.getAll();
            res.json(icdCodes);
        } catch (error) {
            console.error('Error fetching ICD codes:', error);
            res.status(500).json({ message: 'Error fetching ICD codes' });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const icdCode = await IcdCodeService.getById(id);

            if (!icdCode) {
                res.status(404).json({ message: 'ICD code not found' });
                return;
            }

            res.json(icdCode);
        } catch (error) {
            console.error('Error fetching ICD code:', error);
            res.status(500).json({ message: 'Error fetching ICD code' });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const success = await IcdCodeService.delete(id);

            if (!success) {
                res.status(404).json({ message: 'ICD code not found' });
                return;
            }

            res.json({ message: 'ICD code deleted successfully' });
        } catch (error) {
            console.error('ICD code deletion error:', error);
            res.status(500).json({ message: 'Error deleting ICD code' });
        }
    }

    static async count(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const count = await IcdCodeService.count();
            console.log('Count from service:', count); // Debugging
            res.status(200).json({
                success: true,
                count
            });
        } catch (error) {
            console.error('Error in count controller:', error);
            next(error);
        }
    }
    
}