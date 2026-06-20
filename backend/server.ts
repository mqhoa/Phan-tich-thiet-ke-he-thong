import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import patientRoutes from "./routes/patient.routes";
import appointmentRoutes from "./routes/appointment.routes";
import recordRoutes from "./routes/record.routes";
import prescriptionRoutes from "./routes/prescription.routes";
import medicineRoutes from "./routes/medicine.routes";
import interactionRoutes from "./routes/interaction.routes";
import auditRoutes from "./routes/audit.routes";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({
  origin: "http://localhost:5173", // Chỉ định đích danh cổng của frontend Vite
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/audits", auditRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});