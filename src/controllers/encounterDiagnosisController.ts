import { Request, Response } from 'express';
import { DiagnosesService } from '../service/DiagnosisService';

export const addDiagnosis = async (req: Request, res: Response) => {
  try {
    const { encounter_id, icd_code_id, diagnosis_order, icd_code, description,  } = req.body;
    const diagnosisId = await DiagnosesService.create({ encounter_id, icd_code_id, diagnosis_order, icd_code, description });
    res.status(201).json({ message: 'Diagnosis added successfully', diagnosisId });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Failed to add diagnosis', error: error.message });
    }
  }
};

export const getDiagnosesByEncounterId = async (
  req: Request<{ id: string }>, // Explicitly type `id` in the `Request`'s params
  res: Response
): Promise<void> => {
  try {
    const encounterId = parseInt(req.params.id, 10); // Ensure proper parsing
    if (isNaN(encounterId)) {
       res.status(400).json({ message: 'Invalid encounter ID' });
       return;
    }

    const diagnoses = await DiagnosesService.findByEncounterId(encounterId);
    if (!diagnoses) {
      res.status(404).json({ message: 'Diagnoses not found for this encounter' });
      return;
    }

    res.status(200).json(diagnoses);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Failed to retrieve diagnoses', error: error.message });
    }
  }
};

export const listDiagnosesEncounter = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { diagnosis, total } = await DiagnosesService.listDiagnosesEncounter(Number(page), Number(limit));
    res.json({ diagnosis, total });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Failed to list encounter diagnoses', error: error.message });
    }
  }
};

export const updateDiagnosis = async (req: Request, res: Response) => {
  try {
    const diagnosesId = parseInt(req.params.id);
    const updates = req.body;
    const updated = await DiagnosesService.updateDiagnosis(diagnosesId, updates);
    if (updated) {
      res.json({ message: 'Encounter Diagnosis updated successfully' });
    } else {
      res.status(404).json({ message: 'Diagnosis not found' });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Failed to update Encounter diagnosis', error: error.message });
    }
  }
};

export const deleteDiagnosis = async (req: Request, res: Response) => {
  try {
    const diagnosesId = parseInt(req.params.id);
    const deleted = await DiagnosesService.deleteDiagnosis(diagnosesId);
    if (deleted) {
      res.json({ message: 'Diagnosis deleted successfully' });
    } else {
      res.status(404).json({ message: 'Diagnosis not found' });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Failed to delete diagnosis', error: error.message });
    }
  }
};