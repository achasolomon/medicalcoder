// src/models/types.ts


export interface User {
    id?: number;
    username: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    created_at?: Date;
    updated_at?: Date;
}

export interface IcdCode {
    id?: number;
    code: string;
    description: string;
    category: string;
    sub_category: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface CptCode {
    id?: number;
    code: string;
    description: string;
    category: string;
    relative_value_unit: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface Encounter {
    id?: number;
    patient_id: number;
    date_of_service: Date;
    provider_name: string;
    notes?: string | null;
    status: 'pending' | 'coded' | 'billed' | 'completed'; created_at?: Date;
    updated_at?: Date;
    discharge_date?: Date | null;
    type_of_service?: string;
    location?: string;
}



export interface Patient {
    id?: number;
    name: string;
    date_of_birth: Date;
    gender: string;
    address?: string;
    phone_number?: string;
    email: string;
    insurance_number?: number;
    emergency_contact_name: string;
    emergency_contact_relationship: string;
    emergency_contact_phone: string;
    created_at?: Date;
    updated_at?: Date;
}


export interface EncounterDiagnosis {
    id?: number;
    encounter_id: number;
    icd_code_id: number;
    diagnosis_order?: number;
    icd_code?: string;
    description?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface EncounterProcedure {
    id?: number;
    encounter_id: number;
    cpt_code_id: number;
    quantity: number;
    modifier?: string;
    cpt_code?: number;
    description?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}

export interface EncounterFilters {
    status?: string;
    fromDate?: Date;
    toDate?: Date;
    patientId?: string;
}

export interface  PatientUpdates  {
    name: string;
    date_of_birth: Date;
    gender: string;
    address?: string;
    phone_number?: string;
    email?: string;
    insurance_number?: number;
    emergency_contact_name: string;
    emergency_contact_relationship: string;
    emergency_contact_phone: string;
    created_at?: Date;
    updated_at?: Date;
};

export interface SearchResult {
    encounters: Encounter[];
    total: number;
  }
  
 export interface SearchParams {
    query: string;
    page?: number;
    limit?: number;
  }