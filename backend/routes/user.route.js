const router = require("express").Router();
const {
  verifyToken,
  requireRole,
  requireOwnerOrRole,
} = require("../middleware/authMiddleware");
const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  checkEmailLimiter,
} = require("../middleware/rateLimit");

const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const roleController = require("../controllers/role.controller");
const studentController = require("../controllers/student.controller");
const lecturerController = require("../controllers/lecturer.controller");
const problemController = require("../controllers/problem.controller");
const feedbackController = require("../controllers/feedback.controller");
const tagController = require("../controllers/tag.controller");
const notificationController = require("../controllers/notification.controller");

// ==================== Public ====================

router.post("/register", registerLimiter, userController.createUser);
router.post("/login", loginLimiter, authController.login);
router.get("/check-email", checkEmailLimiter, userController.checkEmail);
router.post("/forgot-password", forgotPasswordLimiter, authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// POST /student และ POST /lecturer อยู่ในโซน public เพราะเป็นส่วนหนึ่งของ
// ขั้นตอนสมัครสมาชิก (สมัคร User ก่อน แล้วค่อยกรอกข้อมูลเพิ่มเป็น
// student/lecturer ต่อทันที) — ตอนนั้นยังไม่มี token เพราะยังไม่เคย login
router.post("/student", studentController.createStudent);
router.post("/lecturer", lecturerController.createLecturer);

// ⚠️ BOOTSTRAP ROUTE ถูกลบแล้ว — roles ถูก seed ครบแล้ว (Student/Lecturer/
// Admin) ตอนนี้สร้าง role ใหม่ต้อง login เป็น admin แล้วใช้
// POST /user/role (ล็อกด้วย requireRole(3) ด้านล่าง) แทน

// ==================== Protected ====================

router.use(verifyToken);

// Role
router.get("/users", roleController.getAllRoles);

// ⚠️ ORDER MATTERS: Express matches routes top-to-bottom. These literal
// paths (/user/all, /user/problem) MUST come before "/user/:id" below —
// otherwise "/user/problem" gets matched by "/user/:id" first (with
// id="problem"), which silently breaks the intended route entirely.
router.get("/user/all", requireRole(3), userController.getAllsUser);
router.get("/user/problem", problemController.getAllsProblem);

router.get("/user/:id", roleController.getRole);
router.post("/user/role", requireRole(3), roleController.createRole);
router.put("/user/:id", requireOwnerOrRole("id", 3), userController.updateUser);
router.delete("/user/:id", requireRole(3), userController.deleteUser);

// Problem
router.get("/problem/:id", problemController.getProblem);
router.post("/problem", problemController.createProblem);
router.put("/problem/:id", problemController.updateProblem);
router.put("/problem/update/:id", problemController.updateStatus);
router.put("/problem/open/:id", problemController.openProblem);
router.delete("/problem/:pid", problemController.deleteProblem);

// Feedback (lecturer replies to a problem)
router.get("/feedback", feedbackController.getFeedbackForProblem);
router.post("/feedback", feedbackController.createFeedback);

// Notification (student side)
router.get("/notification", notificationController.getMyNotifications);
router.get("/notification/unread-count", notificationController.getUnreadCount);
router.put("/notification/read-all", notificationController.markAllAsRead);
router.delete("/notification/clear-all", notificationController.clearAll);
router.put("/notification/:id/read", notificationController.markAsRead);
// Student
router.get("/student/all", studentController.getAllsStudent);
router.get("/student", studentController.getSomeStudents);
router.put("/student/:id", studentController.updateStudent);
router.delete(
  "/student/:sid/:uid",
  requireRole(3),
  studentController.deleteAllsStudent
);

// Lecturer
router.get("/lecturer/all", lecturerController.getAllLecturer);
router.get("/lecturer", lecturerController.getSomeLecturers);
router.put("/lecturer/:id", lecturerController.updateLecturer);
router.delete(
  "/lecturer/:id/:uid",
  requireRole(3),
  lecturerController.deleteLecturer
);

// Tag
router.get("/tags", tagController.getAllTags);
router.post("/tags", requireRole(3), tagController.createTag);
router.delete("/tags/:id", requireRole(3), tagController.deleteTag);

module.exports = router;