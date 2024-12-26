import { ValidationError, ServiceError } from '../utils/errors';
import { EncounterModel } from '../models/EncounterModel';
import { Encounter, EncounterFilters, SearchResult, SearchParams } from '../models/types';

export class EncounterService {
  static async create(encounterData: Omit<Encounter, 'id'>): Promise<number> {
    // Validate required fields
    if (!encounterData.patient_id) {
      throw new Error('Patient ID is required');
    }
    if (!encounterData.date_of_service) {
      throw new Error('Date of service is required');
    }
    if (!encounterData.provider_name) {
      throw new Error('Provider name is required');
    }
  
    // Sanitize encounter data
    const sanitizedEncounterData: Omit<Encounter, 'id'> = {
      patient_id: encounterData.patient_id,
      date_of_service: encounterData.date_of_service,
      provider_name: encounterData.provider_name,
      status: encounterData.status || 'pending',
      notes: encounterData.notes || null,
      discharge_date: encounterData.discharge_date || null,
      type_of_service: encounterData.type_of_service,
      location: encounterData.location ,
    };
  
    // Create the encounter
    const encounterId = await EncounterModel.create(sanitizedEncounterData);
  
    return encounterId;
  }


  static async getDetails(id: number) {
    return EncounterModel.getEncounterDetails(id);
  }

  static async list(page: number, limit: number, filters: EncounterFilters) {
    return EncounterModel.list(page, limit, filters);
  }

  static async update(id: number, updates: Partial<Encounter>) {
    return EncounterModel.update(id, updates);
  }

  static async delete(id: number) {
    return EncounterModel.delete(id);
  }

  static async getTotalEncounters(): Promise<number> {
    return await EncounterModel.countTotalEncounters();
  }

  static async search(params: SearchParams): Promise<SearchResult> {
    if (!params.query) {
      throw new ValidationError('Search query is required');
    }

    try {
      // Ensure query is a string, but it could be a number too
      const query = params.query.trim();

      // Call the model to perform the search
      return await EncounterModel.search(
        query,
        params.page || 1,
        params.limit || 50
      );
    } catch (error) {
      throw new ServiceError(
        'Failed to perform encounter search',
        error as Error
      );
    }
}

}