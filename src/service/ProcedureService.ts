import { EncounterModel } from '../models';
import { EncounterProcedure } from '../models/types';

export class ProcedureService {
    static async create(encounterProcedure: EncounterProcedure): Promise<number> {
        const existing = await EncounterModel.getProceduresByEncounterId(encounterProcedure.encounter_id);
        if (existing) {
            throw new Error('Patient already exists');
        }

        const id = await EncounterModel.addProcedure(encounterProcedure);
        return id;
    }

    static async getProceduresByEncounterId(id: number): Promise<EncounterProcedure[]> {
        return EncounterModel.getProceduresByEncounterId(id); // Ensure this returns an array
    }

    static async listDiagnosesEncounter(
        page: number,
        limit: number
    ): Promise<{ procedure: EncounterProcedure[]; total: number }> {
        return EncounterModel.listProceduresEncounter(page, limit);
    }

    static async updateProcedure(
        id: number,
        updates: Partial<Omit<EncounterProcedure, 'cpt_code_id'>> & { cpt_code_id?: number }
    ): Promise<boolean> {
        if (updates.id && updates.id !== id) {
            const existing = await EncounterModel.getProceduresByEncounterId(updates.id);
            if (existing) {
                throw new Error('Patient with this id already exists');
            }
        }
    
        return EncounterModel.updateProcedure(id, updates);
    }

    static async deleteProcedure(id: number): Promise<boolean> {
        return EncounterModel.deleteProcedure(id);
    }
}
