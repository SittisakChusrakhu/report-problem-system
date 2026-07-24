const { z } = require("zod");

// npm install zod --save

const registerSchema = z.object({
  user_name: z.string().trim().min(1, "กรุณากรอกชื่อผู้ใช้"),
  user_email: z
    .string()
    .trim()
    .min(1, "กรุณากรอกอีเมล")
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .regex(/@ubu\.ac\.th$/, "อีเมลต้องเป็น @ubu.ac.th"),
  user_password: z
    .string()
    .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  role_id: z
    .number({ invalid_type_error: "กรุณาเลือกสถานะ (นักเรียน/อาจารย์)" })
    .refine((v) => v === 1 || v === 2, "role_id ต้องเป็น 1 (นักเรียน) หรือ 2 (อาจารย์)"),
});

const loginSchema = z.object({
  user_email: z.string().trim().min(1, "กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  user_password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

const studentSchema = z.object({
  stu_id: z.string().trim().min(1, "กรุณากรอกรหัสนักศึกษา"),
  stu_major: z.string().trim().min(1, "กรุณากรอกสาขา"),
  stu_faculty: z.string().trim().min(1, "กรุณากรอกคณะ"),
  stu_grade: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => [1, 2, 3, 4].includes(v), "ชั้นปีต้องอยู่ระหว่าง 1-4"),
  avatar: z.string().trim().min(1, "กรุณาอัปโหลดรูปโปรไฟล์"),
  user_id: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v > 0, "user_id ไม่ถูกต้อง"),
});

const lecturerSchema = z.object({
  lect_roomnum: z.string().trim().min(1, "กรุณากรอกเลขห้อง"),
  // optional/nullable on the frontend too — matches register.tsx
  lect_faculty: z.string().trim().optional().nullable(),
  avatar: z.string().trim().min(1, "กรุณาอัปโหลดรูปโปรไฟล์"),
  user_id: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v > 0, "user_id ไม่ถูกต้อง"),
});

const checkEmailSchema = z.object({
  email: z.string().trim().min(1, "กรุณาระบุอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
});

module.exports = {
  registerSchema,
  loginSchema,
  studentSchema,
  lecturerSchema,
  checkEmailSchema,
};