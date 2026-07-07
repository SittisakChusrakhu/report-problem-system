const studentService = require("../services/student.service");

exports.getAllsStudent = async (req, res) => {
  try {
    const students = await studentService.getAllStudents();

    res.json(students);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.getSomeStudents = async (req, res) => {
  try {
    const { id } = req.query;
    const students = await studentService.getStudentsByIds(id);

    res.json(students);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const student = await studentService.createStudent(req.body);

    res.json(student);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await studentService.updateStudent(
      req.params.id,
      req.body
    );

    res.json(student);
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Could not update student" });
  }
};

exports.deleteAllsStudent = async (req, res) => {
  try {
    const { sid, uid } = req.params;
    const result = await studentService.deleteStudent(sid, uid);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
