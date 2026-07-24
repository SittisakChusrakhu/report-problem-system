    const rateLimit = require("express-rate-limit");

// จำกัดตาม IP — endpoint พวกนี้ไม่ต้อง login (public) จึงไม่มี requireRole
// มาช่วยกันคนแปลกหน้าได้ ต้องกันด้วย rate limit แทน ไม่งั้นใครก็ยิงรัวๆ
// brute-force รหัสผ่าน, สแปมสมัครสมาชิก, หรือไล่เดาอีเมลผ่าน /check-email
// เพื่อรู้ว่าใครเป็นสมาชิกในระบบบ้าง (email enumeration) ได้ไม่จำกัด

// login: เข้มที่สุด เพราะเป็นเป้าหมายหลักของการเดารหัสผ่าน
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง" },
});

// register / forgot-password: ป้องกันสแปมสร้างบัญชี / สแปมส่งอีเมล
exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ชั่วโมง
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "สมัครสมาชิกบ่อยเกินไป กรุณาลองใหม่ภายหลัง" },
});

exports.forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ชั่วโมง
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "ขอรีเซ็ตรหัสผ่านบ่อยเกินไป กรุณาลองใหม่ภายหลัง" },
});

// check-email: เรียกถี่ได้ตามปกติ (ยิงตอนพิมพ์ทุกครั้ง) แต่ต้องกันการไล่
// เดาอีเมลเป็นชุดใหญ่ๆ อยู่ดี ให้ช่องกว้างกว่ากลุ่มบนหน่อย
exports.checkEmailLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 นาที
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "เรียกใช้งานบ่อยเกินไป กรุณาลองใหม่ภายหลัง" },
});