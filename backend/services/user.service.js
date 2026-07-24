const bcrypt = require("bcrypt");
const userRepository = require("../repositories/user.repository");

const SALT_ROUNDS = 10;

// ใช้ตอนสมัครสมาชิก เช็คแบบ real-time ว่าอีเมลนี้ถูกใช้ไปแล้วหรือยัง
exports.checkEmailExists = async (email) => {
  const user = await userRepository.findByEmail(email);
  return !!user;
};

exports.getAllUsers = async () => {
  const users = await userRepository.getAllUsers();

  return users.map(({ user_password, ...rest }) => rest);
};

exports.createUser = async (body) => {
  const {
    user_name,
    user_password,
    user_email,
    role_id,
  } = body;

  const hashedPassword = await bcrypt.hash(
    user_password,
    SALT_ROUNDS
  );

  return await userRepository.createUser({
    user_name,
    user_password: hashedPassword,
    user_email,
    role_id,
  });
};

exports.updateUser = async (id, body, requester) => {
  const { user_name, user_password, user_email, role_id } = body;

  const data = {
    user_name,
    user_email,
  };

  // role_id ห้ามถูกแก้โดยใครก็ตามที่ไม่ใช่ admin — แม้แต่แก้โปรไฟล์ตัวเอง
  // ก็ห้าม ไม่งั้นผู้ใช้ทั่วไปส่ง { role_id: 3 } มาเองก็ยกระดับเป็นแอดมินได้
  if (role_id !== undefined && requester.role_id === 3) {
    data.role_id = role_id;
  }

  if (user_password) {
    data.user_password = await bcrypt.hash(
      user_password,
      SALT_ROUNDS
    );
  }

  return await userRepository.updateUser(id, data);
};

exports.deleteUser = async (id) => {
  return await userRepository.deleteUser(id);
};