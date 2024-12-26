// utils/validationSchemas.ts
import { z } from 'zod';



// Helper function to validate custom date formats
// const dateValidation = z.string().refine((date) => {
//   return !isNaN(Date.parse(date)); // Check if the date can be parsed
// }, { message: "Invalid date format" });


export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  username: z.string().min(2), // Changed from 'name' to 'username'
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'user']).default('user')
});

export const icdCodeSchema = z.object({
  code: z.string().max(20, { message: "Code must be at most 20 characters long" }).min(1, { message: "Code is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  category: z.string().max(50, { message: "Category must be at most 50 characters long" }).min(1, { message: "Category is required" }),
  sub_category: z.string().max(50, { message: "Sub-category must be at most 50 characters long" }).min(1, { message: "Sub-category is required" })
});


export const cptCodeSchema = z.object({
  code: z.string().min(1, { message: 'Code is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  relative_value_unit: z.number().min(0, { message: 'Relative value unit must be a positive number' })
});

export const patientSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, "Patient name is required"),
  date_of_birth: z.date(),
  gender: z.enum(["Male", "Female", "Other"]),
  address: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email("Invalid email format"),
  insurance_number: z.number().positive().optional(),
  emergency_contact_name: z.string().min(1, "Emergency contact name is required"),
  emergency_contact_relationship: z.string().min(1, "Emergency contact relationship is required"),
  emergency_contact_phone: z.string().min(1, "Emergency contact phone is required"),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

export const encounterSchema = z.object({
  patient_id: z.number().int().positive("Patient ID must be a positive integer"),
  date_of_service: z.string().min(1, "Date of service is required"),
  provider_name: z.string().min(1, "Provider name is required"),
  notes: z.string().nullable().optional(),
  status: z.enum(["pending", "coded", "billed", "completed"]).default("pending"),
  discharge_date: z.string().nullable().optional(),
  type_of_service: z.string().min(1, "Type of service is required"),
  location: z.string().optional(),
});

export const diagnosesSchema =
  z.object({
    id: z.number().int().positive("Diagnosis ID must be a positive integer"),
    encounter_id: z.number()
      .int()
      .positive("Encounter ID in diagnoses must be a positive integer"),
    icd_code_id: z.number().int().positive("ICD Code ID must be a positive integer"),
    diagnosis_order: z.number().int().optional(),
    icd_code: z.string().min(1, "ICD code is required"),
    description: z.string().min(1, "Description is required"),
  })

export const proceduresSchema = 
  z.object({
    id: z.number().int().positive("Procedure ID must be a positive integer"),
    encounter_id: z.number()
      .int()
      .positive("Encounter ID in procedures must be a positive integer"),
    cpt_code_id: z.number().int().positive("CPT Code ID must be a positive integer"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
    modifier: z.string().nullable().optional(), // Allow null or undefined
    cpt_code: z.string().min(1, "CPT code is required"),
    description: z.string().min(1, "Description is required"),
  })


