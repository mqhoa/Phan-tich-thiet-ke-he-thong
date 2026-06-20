
import { Role } from "../types/index";
import { getDB } from "../db/jsonDB";
// Authenticate Authorization header helper
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Vui lòng đăng nhập để thực hiện tác vụ này." });
  }

  const token = authHeader.split(" ")[1];
  if (!token.startsWith("jwt-mock-")) {
    return res.status(403).json({ message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." });
  }

  const parts = token.slice("jwt-mock-".length).split("-");
  const userId = parts[0];
  const role = parts[1] as Role;

  const db = getDB();
  const user = db.users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy người dùng." });
  }

  req.user = user;
  next();
}
export { authenticateToken };

