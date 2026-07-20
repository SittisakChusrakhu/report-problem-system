const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// ต้องเป็นอีเมลที่ verify ไว้ในขั้นที่ 1 เท่านั้น ห้ามเปลี่ยนเป็นอีเมลอื่น
const SENDER_EMAIL = "reporthubnoreply@gmail.com";
const SENDER_NAME = "ระบบแจ้งปัญหานักศึกษา";

const sendViaBrevo = async ({ to, subject, html }) => {
  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { email: SENDER_EMAIL, name: SENDER_NAME },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Brevo error: ${JSON.stringify(data)}`);
  }

  return data;
};

exports.sendProblemNotification = async ({
  to,
  studentName,
  pro_title,
  pro_desc,
  pro_image,
}) => {
  try {
    const data = await sendViaBrevo({
      to,
      subject: `มีการแจ้งปัญหามาจาก ${studentName}`,
      html:
        `<h2>หัวข้อ: ${pro_title}</h2>` +
        `<p>รายละเอียด: ${pro_desc}</p>` +
        (pro_image ? `<img src="${pro_image}"/>` : ""),
    });
    console.log("Email sent:", data.messageId);
  } catch (error) {
    console.error("Email error:", error);
  }
};

exports.sendPasswordResetEmail = async ({ to, resetLink }) => {
  try {
    const data = await sendViaBrevo({
      to,
      subject: "รีเซ็ตรหัสผ่านบัญชีของคุณ",
      html:
        `<h2>คำขอรีเซ็ตรหัสผ่าน</h2>` +
        `<p>คลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์นี้ใช้ได้ 15 นาที):</p>` +
        `<p><a href="${resetLink}">${resetLink}</a></p>` +
        `<p>ถ้าคุณไม่ได้เป็นคนขอรีเซ็ตรหัสผ่าน สามารถละเว้นอีเมลนี้ได้เลย</p>`,
    });
    console.log("Password reset email sent:", data.messageId);
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};
