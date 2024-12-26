import { EncounterModel } from '../models';
import { EncounterDiagnosis } from '../models/types';

export class DiagnosesService {
    static async create(encounterDiagnosis: EncounterDiagnosis): Promise<number> {
        const existing = await EncounterModel.findByEncounterId(encounterDiagnosis.encounter_id);
        if (existing) {
            throw new Error('Diagnosis with this detials already exists');
        }

        const id = await EncounterModel.addDiagnosis(encounterDiagnosis);
        return id;
    }

    static async findByEncounterId(id: number): Promise<EncounterDiagnosis | null> {
        return EncounterModel.findByEncounterId(id);
    }

    static async listDiagnosesEncounter(
        page: number,
        limit: number
    ): Promise<{ diagnosis: EncounterDiagnosis[]; total: number }> {
        return EncounterModel.listDiagnosesEncounter(page, limit);
    }

    static async updateDiagnosis(
        id: number,
        updates: Partial<EncounterDiagnosis>
    ): Promise<boolean> {
        if (updates.id && updates.id !== id) {
            const existing = await EncounterModel.findByEncounterId(updates.id);
            if (existing) {
                throw new Error('Diagnosis with this id already exists');
            }
        }

        return EncounterModel.updateDiagnosis(id, updates);
    }

    static async deleteDiagnosis(id: number): Promise<boolean> {
        return EncounterModel.deleteDiagnosis(id);
    }
}
