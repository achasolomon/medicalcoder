import {Request, Response, NextFunction } from 'express';
import { EncounterService } from '../service/EncounterService';
import { EncounterModel } from '../models/EncounterModel';
import { encounterSchema } from '../utils/validationSchemas';
import { ZodError } from 'zod';


export class EncounterController {
  // List encounters with pagination and filters
  static async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        status: req.query.status as string,
        fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
        patientId: req.query.patientId as string
      };

      const result = await EncounterService.list(page, limit, filters);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error listing encounters:', error);
      res.status(500).json({ 
        message: 'Error listing encounters', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Get encounter details
  static async getDetails(req: Request, res: Response): Promise<void> {
    try {
      const encounterId = parseInt(req.params.id);
      const encounterDetails = await EncounterService.getDetails(encounterId);

      if (!encounterDetails) {
         res.status(404).json({ message: 'Encounter not found' });
         return;
      }

      // Return the encounter details
      res.status(200).json(encounterDetails);
    } catch (error) {
      console.error('Error fetching encounter details:', error);
      res.status(500).json({
        message: 'Error fetching encounter details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create encounter

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        patient_id,
        date_of_service,
        provider_name,
        type_of_service,
        status,
        notes,
        discharge_date,
        location,
      } = req.body;
  
      // Parse and validate the data
      const parsedData = encounterSchema.parse({
        patient_id,
        date_of_service,
        provider_name,
        type_of_service,
        status,
        notes,
        discharge_date,
        location,
      });
  
      // Convert date_of_service and discharge_date to Date objects
      const formattedData = {
        ...parsedData,
        date_of_service: new Date(parsedData.date_of_service), // Convert string to Date
        discharge_date: parsedData.discharge_date
          ? new Date(parsedData.discharge_date)
          : null, // Convert or set null if undefined
      };
  
      // Pass the formatted data to the service
      const encounterId = await EncounterService.create(formattedData);
  
      res.status(201).json({ message: 'Encounter created successfully.', encounterId });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error.',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      } else {
        next(error); // Pass the error to middleware for further handling
      }
    }
  }
  
   // Update encounter
   static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updates = req.body;

    try {
      const updated = await EncounterModel.update(Number(id), updates);

      if (updated) {
        res.status(200).json({ message: 'Encounter updated successfully' });
      } else {
        res.status(404).json({ message: 'Encounter not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to update encounter', error });
    }
  }


   // Delete encounter
   static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const deleted = await EncounterModel.delete(Number(id));

      if (deleted) {
        res.status(200).json({ message: 'Encounter deleted successfully' });
      } else {
        res.status(404).json({ message: 'Encounter not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete encounter', error });
    }
  }

  static getTotalEncounters = async (_req: Request, res: Response) => {
    try {
      const totalEncounters = await EncounterService.getTotalEncounters();
      res.json({ totalEncounters });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Failed to retrieve total encounters', 
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          message: 'Failed to retrieve total encounters', 
          error: String(error) 
        });
      }
    }
  };
  
  static searchEncounter = async (req: Request, res: Response) => {
    try {
      // Input validation
      const query = req.query.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          message: 'Search query is required and must be a string'
        });
      }

      // Parse pagination parameters with defaults
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));

      const result = await EncounterService.search({
        query,
        page,
        limit
      });

      res.json({
        data: result.encounters,
        metadata: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit)
        }
      });

    } catch (error) {
      console.error('Error in searchEncounter:', error);
      
      res.status(500).json({
        message: 'An error occurred while searching encounters',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
}

}


