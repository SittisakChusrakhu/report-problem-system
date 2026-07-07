const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// เช็คว่ามี token ที่ถูกต้องไหม (ต้อง login ก่อนถึงจะเข้าได้)
module.exports.verifyToken = function (req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    // แนบข้อมูล user ที่ decode ได้ไปกับ req เพื่อให้ route/controller ถัดไปใช้ต่อได้
    req.user = decoded; // { id, role_id, user_email }
    next();
  });
};

// เช็ค role เพิ่มเติม ใช้ต่อจาก verifyToken เสมอ
// ตัวอย่าง: requireRole(3) = เฉพาะ admin, requireRole(2, 3) = lecturer หรือ admin
module.exports.requireRole = function (...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: "No token provided" });
    }
    if (!allowedRoles.includes(req.user.role_id)) {
      return res.status(403).json({ message: "Permission denied" });
    }
    next();
  };
};