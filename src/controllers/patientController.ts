import { Request, Response } from 'express';
import { PatientService } from '../service/patientService';


export const createPatient = async (req: Request, res: Response) => {
    try {
      const patient = req.body;
      const patientId = await PatientService.create(patient);
      res.status(201).json({ message: 'Patient created successfully', patientId });
    } catch (error: unknown) {
      // Type guard to check if error is an Error object
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Failed to create patient', 
          error: error.message 
        });
      } else {
        // Handle cases where error might not be an Error instance
        res.status(500).json({ 
          message: 'Failed to create patient', 
          error: String(error) 
        });
      }
    }
  };


  export const getPatientById = async (req: Request, res: Response): Promise<void> => {
    try {
      const  id  = parseInt(req.params.id);
      const patient = await PatientService.getPatientById(id);
      if (!patient) {
        res.status(404).json({ message: 'Patient not found' });
        return;
      }
      res.status(200).json({ patient });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Failed to retrieve patient', 
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          message: 'Failed to retrieve patient', 
          error: String(error) 
        });
      }
    }
  };
  
  export const listPatients = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const patients = await PatientService.listPatients(page, limit);
      res.json(patients);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Failed to list patients', 
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          message: 'Failed to list patients', 
          error: String(error) 
        });
      }
    }
  };
  
  export const updatePatient = async (req: Request, res: Response) => {
    try {
      const patientId = parseInt(req.params.id);
      const updates = req.body;
      const updated = await PatientService.updatePatient(patientId, updates);
      if (updated) {
        res.json({ message: 'Patient updated successfully' });
      } else {
        res.status(404).json({ message: 'Patient not found' });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Failed to update patient', 
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          message: 'Failed to update patient', 
          error: String(error) 
        });
      }
    }
  };
  
  export const deletePatient = async (req: Request, res: Response) => {
    try {
      const patientId = parseInt(req.params.id);
      const deleted = await PatientService.deletePatient(patientId);
      if (deleted) {
        res.json({ message: 'Patient deleted successfully' });
      } else {
        res.status(404).json({ message: 'Patient not found' });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Failed to delete patient', 
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          message: 'Failed to delete patient', 
          error: String(error) 
        });
      }
    }
  };

  export const getTotalPatients = async (_req: Request, res: Response) => {
    try {
      const totalPatients = await PatientService.getTotalPatients();
  
      res.json({ totalPatients });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Failed to retrieve total patients', 
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          message: 'Failed to retrieve total patients', 
          error: String(error) 
        });
      }
    }
  };
 
export const searchPatients = async (req: Request, res: Response) => {
  try{
      const search = await PatientService.search(req.query.query as string);
      res.json({search});
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Failed to retrieve total patients', 
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          message: 'Failed to retrieve total patients', 
          error: String(error) 
        });
      }
    }
  };

export const getPatientDetails = async(req: Request, res: Response) : Promise<void> => {
  const patientId = parseInt(req.params.id);
  try{
    const patientData = await PatientService.getPatientDetails(patientId);
    res.status(200).json(patientData);
  }catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
  } else {
      res.status(500).json({ message: 'An unknown error occurred' });
  }
}
}
