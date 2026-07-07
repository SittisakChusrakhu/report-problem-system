const prisma = require("../src/connection");

exports.findByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: {
      user_email: email,
    },
  });
};

exports.findById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: Number(id) },
  });
};

exports.updatePassword = async (id, hashedPassword) => {
  return await prisma.user.update({
    where: { id: Number(id) },
    data: { user_password: hashedPassword },
  });
};

exports.findStudentProfile = async (userId) => {
  return await prisma.student.findFirst({
    where: {
      user_id: userId,
    },
  });
};

exports.findLecturerProfile = async (userId) => {
  return await prisma.lecturer.findFirst({
    where: {
      user_id: userId,
    },
  });
};

exports.setResetToken = async (userId, hashedToken, expiry) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry: expiry,
    },
  });
};

exports.clearResetToken = async (userId) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
};