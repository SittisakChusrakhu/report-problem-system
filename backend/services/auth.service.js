const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const authRepository = require("../repositories/auth.repository");
const mailer = require("../utils/mailer");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";
const RESET_TOKEN_EXPIRY_MINUTES = 15;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

exports.login = async (user_email, user_password) => {
  const user = await authRepository.findByEmail(user_email);

  if (!user) {
    throw {
      status: 404,
      message: "User not found",
    };
  }

  const isMatch = await bcrypt.compare(
    user_password,
    user.user_password
  );

  if (!isMatch) {
    throw {
      status: 401,
      message: "Incorrect password",
    };
  }

  const token = jwt.sign(
    {
      id: user.id,
      role_id: user.role_id,
      user_email: user.user_email,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );

  let profile = null;

  if (user.role_id === 1) {
    profile = await authRepository.findStudentProfile(user.id);
  } else if (user.role_id === 2) {
    profile = await authRepository.findLecturerProfile(user.id);
  } else {
    const { user_password, ...userWithoutPassword } = user;
    profile = userWithoutPassword;
  }

  return {
    token,
    user: profile,
  };
};

exports.requestPasswordReset = async (user_email) => {
  const user = await authRepository.findByEmail(user_email);

  // Always resolve "successfully" from the caller's perspective even if no
  // account matches — otherwise this endpoint becomes a way to check which
  // emails are registered (user enumeration).
  if (!user) {
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(rawToken, 10);
  const expiry = new Date(
    Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
  );

  await authRepository.setResetToken(user.id, hashedToken, expiry);

  const resetLink = `${FRONTEND_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(
    user.user_email
  )}`;

  await mailer.sendPasswordResetEmail({
    to: user.user_email,
    resetLink,
  });
};

exports.resetPassword = async (user_email, token, newPassword) => {
  const user = await authRepository.findByEmail(user_email);

  const invalidError = {
    status: 400,
    message: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว",
  };

  if (!user || !user.resetToken || !user.resetTokenExpiry) {
    throw invalidError;
  }

  if (new Date() > user.resetTokenExpiry) {
    // Clean up the expired token so it can't linger indefinitely.
    await authRepository.clearResetToken(user.id);
    throw invalidError;
  }

  const isValidToken = await bcrypt.compare(token, user.resetToken);

  if (!isValidToken) {
    throw invalidError;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await authRepository.updatePassword(user.id, hashedPassword);
  // One-time use: clear it so the same email link can't be replayed.
  await authRepository.clearResetToken(user.id);
};