const studentRepository = require("../repositories/student.repository");

const shapeStudent = (student) => ({
  id: student.id,
  uid: student.user.id,
  username: student.user.user_name,
  stu_id: student.stu_id,
  stu_email: student.user.user_email,
  stu_grade: student.stu_grade,
  stu_faculty: student.stu_faculty,
  stu_major: student.stu_major,
  avatar: student.avatar,
});

exports.getAllStudents = async () => {
  const students = await studentRepository.findAll();

  return students.map(shapeStudent);
};

exports.getStudentsByIds = async (id) => {
  const ids = [Number(id)];
  const students = await studentRepository.findByIds(ids);

  return students.map(shapeStudent);
};

exports.createStudent = async (body) => {
  const { stu_id, stu_major, stu_grade, stu_faculty, avatar, user_id } = body;

  const student = await studentRepository.create({
    stu_id,
    stu_major,
    stu_grade: Number(stu_grade),
    stu_faculty,
    avatar,
    user: { connect: { id: Number(user_id) } },
  });

  return shapeStudent(student);
};

exports.updateStudent = async (id, body) => {
  const { stu_id, stu_major, stu_grade, stu_faculty, avatar, uid } = body;

  const userData = uid
    ? {
        user_name: uid.username,
        user_email: uid.stu_email,
      }
    : undefined;

  const student = await studentRepository.update(
    id,
    {
      stu_id,
      stu_major,
      stu_grade: stu_grade !== undefined ? Number(stu_grade) : undefined,
      stu_faculty,
      avatar,
    },
    userData
  );

  return shapeStudent(student);
};

exports.deleteStudent = async (sid, uid) => {
  await studentRepository.deleteWithUser(sid, uid);

  return "delete successfully";
};
