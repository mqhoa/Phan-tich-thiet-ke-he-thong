import { Router, Request, Response } from "express";
import { getDB, saveDB, logAudit } from "../db/jsonDB";
import { authenticateToken } from "../middleware/auth.middleware";
import { Role, User, Patient } from "../types/index";

const router = Router();

router.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Vui lòng nhập tài khoản và mật khẩu." });
  }

  const db = getDB();
  const user = db.users.find(u => u.username === username);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không chính xác." });
  }

  // Create a simulated JWT structured as jwt-mock-[user_id]-[role]
  const token = `jwt-mock-${user._id}-${user.role}-${Date.now()}`;
  
  // Exclude password from returned user object
  const { password: _, ...userSafe } = user;

  logAudit(user._id, user.username, user.role, "LOGIN", "User", user._id, `Người dùng ${user.name} đăng nhập thành công.`);

  res.json({
    token,
    user: userSafe
  });
});


router.post("/register", (req: Request, res: Response) => {
  const { username, password, name, email, phone, gender, dob, address, insuranceNumber } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ message: "Vui lòng nhập tài khoản, mật khẩu và họ tên." });
  }

  const db = getDB();
  const userExists = db.users.some(u => u.username === username);
  if (userExists) {
    return res.status(400).json({ message: "Tên tài khoản này đã tồn tại." });
  }

  const userId = "u_" + Date.now();
  const patientId = "pat_" + Date.now();

  // Create Patient record linked to this PATIENT account
  const newPatient: Patient = {
    _id: patientId,
    fullName: name,
    gender: gender || "Chưa xác định",
    dob: dob || new Date().toISOString().split("T")[0],
    address: address || "",
    phone: phone || "",
    insuranceNumber: insuranceNumber || "",
    email: email || ""
  };

  const newUser: User = {
    _id: userId,
    username,
    password,
    name,
    role: Role.PATIENT,
    email: email || "",
    phone: phone || "",
    patientId: patientId
  };

  db.patients.push(newPatient);
  db.users.push(newUser);
  saveDB(db);

  logAudit(userId, username, Role.PATIENT, "REGISTER", "User", userId, `Đăng ký tài khoản bệnh nhân và hồ sơ y tế: ${name}`);

  const token = `jwt-mock-${newUser._id}-${newUser.role}-${Date.now()}`;
  const { password: _, ...userSafe } = newUser;

  res.status(201).json({
    token,
    user: userSafe
  });
});

router.get("/me", authenticateToken, (req: any, res: Response) => {
  const { password, ...userSafe } = req.user;
  res.json(userSafe);
});

export default router;