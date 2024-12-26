import { EncounterModel } from '../models';
import { Patient, PatientUpdates } from '../models/types';

export class PatientService {
    static async create(patient: Patient): Promise<string> {
        try {
            console.log('Creating new patient...');
            const id = await EncounterModel.createPatient(patient);
            console.log('New patient created with ID:', id);
            return id.toString();
        } catch (error) {
            console.error('Error creating patient:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to create patient');
        }
    }

    static async getPatientById(id: number): Promise<Patient | null> {
        return EncounterModel.getPatientById(id);
    }

    static async listPatients(page: number, limit: number): Promise<{ names: Patient[]; total: number }> {
        return EncounterModel.listPatients(page, limit);
    }

    static async updatePatient(id: number, updates: PatientUpdates): Promise<boolean> {
        if (updates.name) {
            const existingPatients = await EncounterModel.findPatientByName(updates.name);
            if (!existingPatients) {
                throw new Error('Patient not found');
            }
            const duplicate = existingPatients.find(patient => patient.id !== id);
            if (duplicate) {
                throw new Error('Patient with this name already exists');
            }
        }
    
        return EncounterModel.update(id, updates);
    }

    static async deletePatient(id: number): Promise<boolean> {
        return EncounterModel.deletePatient(id);
    }
    static async getTotalPatients(): Promise<number> {
        // Call the model function
        const totalPatients = await EncounterModel.countTotalPatients();
        return totalPatients;
      }
      static async search(query: string): Promise<Patient[]> {
        return EncounterModel.findPatientByName(query);
    }

    // get patient details
    static async getPatientDetails(id: number): Promise<{
        patient: Patient;
        encounters: any[];
    }> {
        // Fetch patient details
        const patient = await EncounterModel.getPatientById(id);

        if (!patient) {
            throw new Error('Patient not found');
        }

        // Fetch all encounters for the patient
        const encounters = await EncounterModel.getEncountersByPatientId(id);

        // Add diagnoses and procedures to each encounter
        const enrichedEncounters = await Promise.all(
            encounters.map(async (encounter: any) => {
                const details = await EncounterModel.getEncounterDetails(encounter.id);
                return {
                    ...encounter,
                    diagnoses: details?.diagnoses || [],
                    procedures: details?.procedures || [],
                };
            })
        );

        return {
            patient,
            encounters: enrichedEncounters,
        };
    }

}