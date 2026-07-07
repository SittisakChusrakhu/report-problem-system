const bcrypt = require("bcrypt");
const userRepository = require("../repositories/user.repository");

const SALT_ROUNDS = 10;

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

exports.updateUser = async (id, body) => {
  const {
    user_name,
    user_password,
    user_email,
    role_id,
  } = body;

  const data = {
    user_name,
    user_email,
    role_id,
  };

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