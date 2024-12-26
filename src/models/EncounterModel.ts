import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db';
import { Encounter, EncounterDiagnosis, EncounterProcedure, EncounterFilters, Patient, PatientUpdates } from './types';
import {format} from 'date-fns';
import {ValidationError} from '../utils/errors'


interface PatientCountResult extends RowDataPacket {
  totalPatients: number;
}
interface EncounterCountResult extends RowDataPacket {
  totalEncounters: number;
}

interface ActiveEncountersRow extends RowDataPacket {
  status: string;
}
interface EncounterChartRow extends RowDataPacket {
  date_of_service: string;
  totalEncounters: number;
}
interface PatientChartRow extends RowDataPacket {
  created_at: string;
  totalPatients: number;
}
export class EncounterModel {
  static async initializeTable(): Promise<void> {
    const createPatientsTableSQL = `
        CREATE TABLE IF NOT EXISTS patients (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            date_of_birth DATE,
            gender VARCHAR(50),
            address VARCHAR(255),
            phone_number VARCHAR(20),
            email VARCHAR(255),
            insurance_number VARCHAR(50),
            emergency_contact_name VARCHAR(255),
            emergency_contact_relationship VARCHAR(100),
            emergency_contact_phone VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;

    const createEncountersTableSQL = `
        CREATE TABLE IF NOT EXISTS encounters (
            id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT NOT NULL,
            date_of_service DATETIME NOT NULL,
            provider_name VARCHAR(255) NOT NULL,
            notes TEXT,
            status VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            discharge_date DATETIME,
            type_of_service VARCHAR(100),
            location VARCHAR(255),
            FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
        )
    `;

        const createEncounterDiagnosesTableSQL = `
      CREATE TABLE IF NOT EXISTS encounter_diagnoses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        encounter_id INT NOT NULL,
        icd_code_id INT NOT NULL,
        diagnosis_order INT,
        icd_code VARCHAR(20) NOT NULL,
        description VARCHAR(1500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (encounter_id) REFERENCES encounters(id) ON DELETE CASCADE,
        FOREIGN KEY (icd_code_id) REFERENCES icd_codes(id) ON DELETE CASCADE,
        FOREIGN KEY (icd_code) REFERENCES icd_codes(code) ON DELETE CASCADE

        )

    `;

    const createEncounterProceduresTableSQL = `
        CREATE TABLE IF NOT EXISTS encounter_procedures (
            id INT AUTO_INCREMENT PRIMARY KEY,
            encounter_id INT NOT NULL,
            cpt_code_id INT NOT NULL,
            quantity INT NOT NULL,
            modifier VARCHAR(10),
            cpt_code VARCHAR(20) NOT NULL,
            description VARCHAR(1500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (encounter_id) REFERENCES encounters(id) ON DELETE CASCADE,
            FOREIGN KEY (cpt_code_id) REFERENCES cpt_codes(id) ON DELETE CASCADE,
            FOREIGN KEY (cpt_code) REFERENCES cpt_codes(code) ON DELETE CASCADE

        )
    `;

    try {
      await pool.execute(createPatientsTableSQL);
      await pool.execute(createEncountersTableSQL);
      await pool.execute(createEncounterDiagnosesTableSQL);
      await pool.execute(createEncounterProceduresTableSQL);

      console.log("Database initialized successfully.");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw new Error('Database error while initializing tables');
    }
  }

  static async create(encounter: Encounter): Promise<number> {
    const dateOfService = format(new Date(encounter.date_of_service), 'yyyy-MM-dd HH:mm:ss');
    const dischargeDate = encounter.discharge_date
      ? format(new Date(encounter.discharge_date), 'yyyy-MM-dd HH:mm:ss')
      : null;
  
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO encounters (patient_id, date_of_service, provider_name, notes, status, discharge_date, type_of_service, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        encounter.patient_id,
        dateOfService,
        encounter.provider_name,
        encounter.notes || null,
        encounter.status || 'pending',
        dischargeDate,
        encounter.type_of_service,
        encounter.location || null,
      ]
    );
  
    return result.insertId;
  }

  static async addDiagnosis(diagnosis: EncounterDiagnosis): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO encounter_diagnoses (encounter_id, icd_code_id, diagnosis_order, icd_code, description ) VALUES (?, ?, ?, ?, ?)',
      [
        diagnosis.encounter_id,
        diagnosis.icd_code_id,
        diagnosis.diagnosis_order || null,
        diagnosis.icd_code,
        diagnosis.description

      ]
    );
    return result.insertId;
  }

  static async addProcedure(procedure: EncounterProcedure): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO encounter_procedures (encounter_id, cpt_code_id, quantity, modifier, cpt_code, description) VALUES (?, ?, ?, ?, ?, ?)',
      [
        procedure.encounter_id,
        procedure.cpt_code_id,
        procedure.quantity,
        procedure.modifier || null,
        procedure.cpt_code,
        procedure.description,
      ]
    );
    return result.insertId;
  }

  static async getEncounterDetails(id: number): Promise<{
    encounter: Encounter;
    diagnoses: EncounterDiagnosis[];
    procedures: EncounterProcedure[];
  } | null> {
    const encounter = await this.findById(id);
    if (!encounter) return null;

    const [diagnoses] = await pool.execute<RowDataPacket[]>(
      `SELECT ed.*, ic.code, ic.description 
           FROM encounter_diagnoses ed
           JOIN icd_codes ic ON ed.icd_code_id = ic.id
           WHERE ed.encounter_id = ?
           ORDER BY ed.diagnosis_order`,
      [id]
    );

    const [procedures] = await pool.execute<RowDataPacket[]>(
      `SELECT ep.*, cc.code, cc.description 
           FROM encounter_procedures ep
           JOIN cpt_codes cc ON ep.cpt_code_id = cc.id
           WHERE ep.encounter_id = ?`,
      [id]
    );

    return {
      encounter,
      diagnoses: diagnoses as EncounterDiagnosis[],
      procedures: procedures as EncounterProcedure[]
    };
  }
  static async getEncountersByPatientId(patientId: number): Promise<any[]> {
    const [rows]: [RowDataPacket[], any] = await pool.execute(
        `SELECT * FROM encounters WHERE patient_id = ?`,
        [patientId]
    );
    return rows;
}
static async search(
  query: string,
  page: number = 1,
  limit: number = 50
): Promise<{ encounters: Encounter[]; total: number }> {
  // Input validation
  if (!query) {
    throw new ValidationError('Search query is required');
  }

  const offset = (page - 1) * limit;
  const searchTerm = query.trim();
  
  // Check if query is numeric or date
  const patientId = !isNaN(Number(searchTerm)) ? Number(searchTerm) : null;
  const nameSearch = `%${searchTerm}%`;
  const dateSearch = searchTerm.match(/^\d{4}-\d{2}-\d{2}$/) ? searchTerm : null;
  
  // Build the WHERE clause dynamically
  const whereConditions = [];
  const params = [];

  // Patient ID condition
  if (patientId !== null) {
    whereConditions.push('e.patient_id = ?');
    params.push(patientId);
  }

  // Text search conditions
  whereConditions.push('e.provider_name LIKE ?');
  whereConditions.push('e.location LIKE ?');
  whereConditions.push('e.type_of_service LIKE ?');
  whereConditions.push('e.status = ?');
  params.push(nameSearch, nameSearch, nameSearch, searchTerm);

  // Date condition
  if (dateSearch) {
    whereConditions.push('DATE(e.date_of_service) = ?');
    params.push(dateSearch);
  }

  const whereClause = whereConditions.join(' OR ');
  
  const [rows, totalRows] = await Promise.all([
    pool.execute<RowDataPacket[]>(
      `SELECT /* INDEX(encounters idx_encounter_search) */
        e.*
       FROM encounters e
       WHERE ${whereClause}
       ORDER BY e.date_of_service DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total
       FROM encounters e
       WHERE ${whereClause}`,
      params
    )
  ]);
  
  return {
    encounters: rows[0] as Encounter[],
    total: totalRows[0][0].total
  };
}


  // Implement other methods like findById, update, list, delete as needed
  static async findById(id: number): Promise<Encounter | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM encounters WHERE id = ?',
      [id]
    );
    return rows.length ? rows[0] as Encounter : null;
  }

  static async list(
    page: number = 1,
    limit: number = 20,
    filters?: EncounterFilters
  ): Promise<{ encounters: Encounter[], total: number }> {
    let query = 'SELECT * FROM encounters WHERE 1=1';
    const params: any[] = [];

    if (filters) {
      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }
      // Add other filter conditions similarly
    }

    query += ' ORDER BY date_of_service DESC LIMIT ? OFFSET ?';
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const [encounters] = await pool.execute<RowDataPacket[]>(query, params);
    const [countResult] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM encounters',
      []
    );

    return {
      encounters: encounters as Encounter[],
      total: (countResult[0] as { total: number }).total
    };
  }

  static async update(id: number, updates: Partial<Encounter>): Promise<boolean> {
    const setClauses: string[] = [];
    const params: any[] = [];

    // Dynamically build the SET clause based on the provided updates
    for (const [key, value] of Object.entries(updates)) {
      setClauses.push(`${key} = ?`);
      params.push(value);
    }

    // Add the encounter ID to the parameters for the WHERE clause
    params.push(id);

    // Build the final SQL query
    const query = `
            UPDATE encounters
            SET ${setClauses.join(', ')}
            WHERE id = ?
        `;

    try {
      const [result] = await pool.execute<ResultSetHeader>(query, params);
      return result.affectedRows > 0; // If any row is affected, return true
    } catch (error) {
      console.error('Error updating encounter:', error);
      return false;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM encounters WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0; // Return true if a row was deleted
    } catch (error) {
      console.error('Error deleting encounter:', error);
      return false;
    }
  }

  static countTotalEncounters = async (): Promise<number> => {
    const query = 'SELECT COUNT(*) AS totalEncounters FROM encounters';
    const [rows] = await pool.execute<EncounterCountResult[]>(query);
    return rows[0].totalEncounters;
  };

  static async getDashboardChartData() {
    const query = `
      SELECT 
        DATE(date_of_service) AS date, 
        COUNT(*) AS totalEncounters
      FROM encounters
      GROUP BY DATE(date_of_service)
      ORDER BY DATE(date_of_service) ASC;
    `;
    const [rows] = await pool.execute<EncounterChartRow[]>(query);
    return rows;
  }
  static async countActive(): Promise<number> {
    const query = 'SELECT COUNT(*) AS activeEncounters FROM encounters WHERE status = "active"';
    const [rows] = await pool.execute<ActiveEncountersRow[]>(query);
    return rows[0].activeEncounters;
  }


//check duplicate patient
static async checkForDuplicates(patient: Patient): Promise<{ isDuplicate: boolean; reason: string }> {
  // Check email
  const [emailResults] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM patients WHERE email = ?',
      [patient.email]
  );
  
  if (emailResults.length > 0) {
      return { isDuplicate: true, reason: 'email' };
  }

  // Check insurance number if provided
  if (patient.insurance_number) {
      const [insuranceResults] = await pool.execute<RowDataPacket[]>(
          'SELECT id FROM patients WHERE insurance_number = ?',
          [patient.insurance_number]
      );
      
      if (insuranceResults.length > 0) {
          return { isDuplicate: true, reason: 'insurance number' };
      }
  }

  return { isDuplicate: false, reason: '' };
}

//create patient

static async createPatient(patient: Patient): Promise<number> {
  // First check for duplicates
  const duplicateCheck = await this.checkForDuplicates(patient);
  if (duplicateCheck.isDuplicate) {
      throw new Error(`Patient with this ${duplicateCheck.reason} already exists`);
  }

  // If no duplicates, create the patient
  const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO patients (name, date_of_birth, gender, address, phone_number, email, insurance_number, emergency_contact_name, emergency_contact_relationship, emergency_contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
          patient.name,
          patient.date_of_birth,
          patient.gender,
          patient.address,
          patient.phone_number,
          patient.email,
          patient.insurance_number,
          patient.emergency_contact_name,
          patient.emergency_contact_relationship,
          patient.emergency_contact_phone
      ]
  );
  return result.insertId;
}
  // Get a patient by ID
  static async getPatientById(id: number): Promise<Patient | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM patients WHERE id = ?',
      [id]
    );

    // Type assertion to cast row to Patient
    const patient = rows[0] as Patient | undefined;
    return patient || null;
  }
  //find patient by name name
  static async findPatientByName(query: string): Promise<Patient[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT * FROM patients 
         WHERE name LIKE ? 
         OR email LIKE ? 
         OR date_of_birth LIKE ? 
         OR insurance_number LIKE ? 
         OR emergency_contact_name LIKE ? 
         OR emergency_contact_phone LIKE ? 
         LIMIT 50`,
        Array(6).fill(`%${query}%`)
    );
    return rows as Patient[];
}

  // List all patients
  static async listPatients(page: number = 1, limit: number = 50): Promise<{ names: Patient[], total: number }> {
    const offset = (page - 1) * limit;
    const [names] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM patients LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [countResult] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM cpt_codes');
    return {
      names: names as Patient[],
      total: (countResult[0] as { total: number }).total
    };
  }
  // Update a patient
  static async updatePatient(id: number, updates: PatientUpdates): Promise<boolean> {
    const fields = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE patients SET ${fields} WHERE id = ?`,
        values
    );

    return result.affectedRows > 0;
}

  // Delete a patient
  static async deletePatient(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM patients WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
  static countTotalPatients = async (): Promise<number> => {
    const query = 'SELECT COUNT(*) AS totalPatients FROM patients';
    const [rows] = await pool.execute<PatientCountResult[]>(query);
    return rows[0].totalPatients;
  };

  static async getChartData() {
    const query = `
      SELECT 
        DATE(created_at) AS date, 
        COUNT(*) AS totalPatients
      FROM patients
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC;
    `;
    const [rows] = await pool.execute<PatientChartRow[]>(query);
    return rows;
  }

  // Get diagnoses by encounter ID
  static async getDiagnosesByEncounterId(encounterId: number): Promise<EncounterDiagnosis[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM encounter_diagnoses WHERE encounter_id = ?',
      [encounterId]
    );
    const diagnoses = rows.map(row => row as EncounterDiagnosis);
    return diagnoses;
  }
  // List all procedures
  static async listDiagnosesEncounter(page: number = 1, limit: number = 50): Promise<{ diagnosis: EncounterDiagnosis[], total: number }> {
    const offset = (page - 1) * limit;
    const [diagnosis] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM encounter_diagnoses LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [countResult] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM encounter_diagnoses');
    return {
      diagnosis: diagnosis as EncounterDiagnosis[],
      total: (countResult[0] as { total: number }).total
    };

  }
  // Update a diagnosis
  static async updateDiagnosis(id: number, updates: { icd_code_id?: number, diagnosis_order?: number }): Promise<boolean> {
    const fields = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE encounter_diagnoses SET ${fields} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }
  // find diagnosis by encounter_id
  static async findByEncounterId(encounter_id: number): Promise<EncounterDiagnosis | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM encounter_diagnoses WHERE encounter_id = ?',
      [encounter_id]
    );
    return rows.length ? rows[0] as EncounterDiagnosis : null;
  }

  
  // Delete a diagnosis
  static async deleteDiagnosis(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM encounter_diagnoses WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }


  // Get procedures by encounter ID
  static async getProceduresByEncounterId(encounterId: number): Promise<EncounterProcedure[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM encounter_procedures WHERE encounter_id = ?',
      [encounterId]
    );
    const procedure = rows.map(row => row as EncounterProcedure);
    return procedure;
  }

  // List all procedures


  static async listProceduresEncounter(page: number = 1, limit: number = 50): Promise<{ procedure: EncounterProcedure[], total: number }> {
    const offset = (page - 1) * limit;
    const [procedure] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM encounter_procedures LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [countResult] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM encounter_procedures');
    return {
      procedure: procedure as EncounterProcedure[],
      total: (countResult[0] as { total: number }).total
    };
  }

  // Update a procedure
  static async updateProcedure(id: number, updates: { cpt_code_id?: number, quantity?: number, modifier?: string }): Promise<boolean> {
    const fields = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE encounter_procedures SET ${fields} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Delete a procedure
  static async deleteProcedure(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM encounter_procedures WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }


}
