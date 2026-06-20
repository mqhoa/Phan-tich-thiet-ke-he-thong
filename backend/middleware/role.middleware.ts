import { Role } from "../types/index";
function authorizeRoles(...allowedRoles: Role[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Bạn không có quyền thực hiện chức năng này." });
    }
    next();
  };
}
export { authorizeRoles };
