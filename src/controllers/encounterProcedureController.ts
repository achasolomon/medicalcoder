import { Request, Response } from 'express';
import { ProcedureService } from '../service/ProcedureService';

export const addProcedure = async (req: Request, res: Response) => {
  try {
    const { encounter_id, cpt_code_id, quantity, modifier } = req.body;
    const procedureId = await ProcedureService.create({ encounter_id, cpt_code_id, quantity, modifier });
    res.status(201).json({ message: 'Procedure added successfully', procedureId });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Failed to add procedure', error: error.message });
    }
  }
};

export const getProceduresByEncounterId = async (
  req: Request <{ id: string }>, 
  res: Response ): Promise<void> => {
  try {
    const encounterId = parseInt(req.params.id,);
    const procedures = await ProcedureService.getProceduresByEncounterId(encounterId);
    if (!procedures || procedures.length === 0) {
      res.status(404).json({ message: 'Procedures not found for this encounter' });
      return;
    }
    res.json(procedures);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Failed to retrieve procedures', error: error.message });
    }
  }
};

export const listProceduresEncounter = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const proceduresData = await ProcedureService.listDiagnosesEncounter(Number(page), Number(limit));
    res.json(proceduresData);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Failed to list encounter procedures', error: error.message });
    }
  }
};

export const updateProcedure = async (req: Request, res: Response) => {
  try {
    const procedureId = parseInt(req.params.id);
    const updates = req.body;
    const updated = await ProcedureService.updateProcedure(procedureId, updates);
    if (updated) {
      res.json({ message: 'Encounter Procedure updated successfully' });
    } else {
      res.status(404).json({ message: 'Procedure not found' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Failed to update Encounter Procedure', error: error.message });
    }
  }
};

export const deleteProcedure = async (req: Request, res: Response) => {
  try {
    const procedureId = parseInt(req.params.id);
    const deleted = await ProcedureService.deleteProcedure(procedureId);
    if (deleted) {
      res.json({ message: 'Procedure deleted successfully' });
    } else {
      res.status(404).json({ message: 'Procedure not found' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Failed to delete procedure', error: error.message });
    }
  }
};
