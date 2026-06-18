export enum Role {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PHARMACIST = 'PHARMACIST',
  PATIENT = 'PATIENT',
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PrescriptionStatus {
  PENDING = 'PENDING',
  DISPENSED = 'DISPENSED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  _id: string;
  username: string;
  password?: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  patientId?: string; // If role is PATIENT, link to their patient record
  doctorId?: string; // If role is DOCTOR, link to their doctor ID
}

export interface Patient {
  _id: string;
  fullName: string;
  gender: string;
  dob: string;
  address: string;
  phone: string;
  insuranceNumber: string;
  email?: string;
}

export interface Appointment {
  _id: string;
  code: string;
  patient_id: string;
  doctor_id: string;
  appointmentDate: string;
  status: AppointmentStatus;
  reason: string;
}

export interface MedicalRecord {
  _id: string;
  code: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string;
  symptoms: string;
  diagnosis: string;
  notes: string;
  visitDate: string;
}

export interface PrescriptionDetail {
  _id: string;
  code: string;
  prescription_id: string;
  medicine_id: string;
  quantity: number;
  dosage: string;
  instruction: string;
}

export interface Prescription {
  _id: string;
  code: string;
  patient_id: string;
  doctor_id: string;
  medicalRecord_id: string;
  createdAt: string;
  status: PrescriptionStatus;
  details: PrescriptionDetail[]; // Embedded detail records for simplicity and robust state
}

export interface Medicine {
  _id: string;
  code: string;
  name: string;
  stock: number;
  unit: string;
  price: number;
  expiryDate: string;
}

export interface DrugInteraction {
  _id: string;
  code: string;
  medicineA: string; // medicine_id or name/code A
  medicineB: string; // medicine_id or name/code B
  warning: string;
}

export interface Audit {
  _id: string;
  user_id: string;
  username: string;
  role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  timestamp: string;
}
