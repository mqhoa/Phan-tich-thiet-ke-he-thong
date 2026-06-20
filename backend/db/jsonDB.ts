
import fs from "fs";
import path from "path";
import { Audit } from "../types/index";
import {
  DEFAULT_USERS,
  DEFAULT_PATIENTS,
  DEFAULT_APPOINTMENTS,
  DEFAULT_MEDICAL_RECORDS,
  DEFAULT_PRESCRIPTIONS,
  DEFAULT_MEDICINES,
  DEFAULT_DRUG_INTERACTIONS,
  DEFAULT_AUDITS,
  EHealthDB
} from "./seedData";

const DB_FILE_PATH = path.join(
  process.cwd(),
  "db",
  "e_health_db.json"
);

// Read database from file, or initialize with seed data if absent
function getDB(): EHealthDB {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const fileContent = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error("Error reading database file, resetting to defaults:", error);
  }

  // If not existing or error occurred, create the default db setup
  const initDB: EHealthDB = {
    users: DEFAULT_USERS,
    patients: DEFAULT_PATIENTS,
    appointments: DEFAULT_APPOINTMENTS,
    medical_records: DEFAULT_MEDICAL_RECORDS,
    prescriptions: DEFAULT_PRESCRIPTIONS,
    medicines: DEFAULT_MEDICINES,
    drug_interactions: DEFAULT_DRUG_INTERACTIONS,
    audits: DEFAULT_AUDITS,
  };
  saveDB(initDB);
  return initDB;
}

function saveDB(db: EHealthDB) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to database file:", error);
  }
}

// Log audit helper
function logAudit(userId: string, username: string, role: string, action: string, entityType: string, entityId: string, details: string) {
  const db = getDB();
  const newAudit: Audit = {
    _id: "aud_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    user_id: userId,
    username,
    role,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
    timestamp: new Date().toISOString(),
  };
  db.audits.unshift(newAudit); // Newest first
  saveDB(db);
}

export {
  getDB,
  saveDB,
  logAudit
};