const lecturerRepository = require("../repositories/lecturer.repository");

const shapeLecturer = (lecturer) => ({
  id: lecturer.id,
  uid: lecturer.user.id,
  username: lecturer.user.user_name,
  user_email: lecturer.user.user_email,
  lect_roomnum: lecturer.lect_roomnum,
  lect_faculty: lecturer.lect_faculty,
  avatar: lecturer.avatar,
});

exports.getAllLecturers = async () => {
  const lecturers = await lecturerRepository.findAll();

  return lecturers.map(shapeLecturer);
};

exports.getLecturersByIds = async (id) => {
  const ids = [Number(id)];
  const lecturers = await lecturerRepository.findByIds(ids);

  return lecturers.map(shapeLecturer);
};

exports.createLecturer = async (body) => {
  const { lect_roomnum, lect_faculty, avatar, user_id } = body;

  const lecturer = await lecturerRepository.create({
    lect_roomnum,
    lect_faculty,
    avatar,
    user: { connect: { id: Number(user_id) } },
  });

  return shapeLecturer(lecturer);
};

exports.updateLecturer = async (id, body) => {
  const { lect_roomnum, lect_faculty, avatar, uid } = body;

  const userData = uid
    ? {
        user_name: uid.user_name,
        user_email: uid.user_email,
      }
    : undefined;

  const lecturer = await lecturerRepository.update(
    id,
    { lect_roomnum, lect_faculty, avatar },
    userData
  );

  return shapeLecturer(lecturer);
};

exports.deleteLecturer = async (id, uid) => {
  await lecturerRepository.deleteWithUser(id, uid);

  return "delete successfully";
};