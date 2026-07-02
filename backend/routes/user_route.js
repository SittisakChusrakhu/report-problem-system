const router = require("express").Router();
const {
  getAllsroles,
  getOneroles,
  getAllsProblem,
  getAllsUser,
  getAllsStudent,
  getSomeStudents,
  getAllLecturer,
  getSomeLecturers,
  getAllTags,
  createroles,
  createUser,
  createProblem,
  createStudent,
  createLecturer,
  createTag,
  updateUser,
  updateLecturer,
  updateStudent,
  updateProblem,
  updateStatus,
  deleteUser,
  deleteStudent,
  deleteProblem,
  deleteAllsStudent,
  deleteTag,
  login,
} = require("../controllers/user_controller");

router.get("/users", getAllsroles);
router.get("/user/all", getAllsUser);
router.get("/user/problem", getAllsProblem);
router.get("/student/all", getAllsStudent);
router.get("/student/", getSomeStudents);
router.get("/lecturer/all", getAllLecturer);
router.get("/lecturer/", getSomeLecturers);
router.get("/user/:id", getOneroles);
router.post("/user/role", createroles);
router.post("/register", createUser);
router.post("/problem", createProblem);
router.post("/student", createStudent);
router.put("/student/:id", updateStudent);
router.post("/lecturer", createLecturer);
router.put("/lecturer/:id", updateLecturer);
router.post("/login", login);
router.put("/user/:id", updateUser);
router.put("/problem/:id", updateProblem);
router.put("/problem/update/:id",updateStatus);
router.delete("/user/:id", deleteUser);
router.delete("/student/:sid/:uid", deleteAllsStudent);
router.delete("/problem/:pid", deleteProblem);
router.get('/tags', getAllTags);
router.post('/tags',createTag);
router.delete('/tags/:id', deleteTag);

module.exports = router;