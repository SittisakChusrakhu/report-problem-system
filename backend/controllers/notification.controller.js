const notificationService = require("../services/notification.service");

// GET /notification?sid=<studentId>  หรือ  ?lid=<lecturerId>
// รายการแจ้งเตือนของนักศึกษา/อาจารย์คนนั้น (เรียงล่าสุดก่อน, จำกัด 30 รายการ)
exports.getMyNotifications = async (req, res) => {
  try {
    const { sid, lid } = req.query;

    if (!sid && !lid) {
      return res.status(400).json({ message: "ต้องระบุ sid หรือ lid" });
    }

    const notifications = lid
      ? await notificationService.getForLecturer(lid)
      : await notificationService.getForStudent(sid);

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงการแจ้งเตือน" });
  }
};

// GET /notification/unread-count?sid=  หรือ  ?lid=  — ใช้กับตัวเลขสีแดงบนกระดิ่ง
exports.getUnreadCount = async (req, res) => {
  try {
    const { sid, lid } = req.query;

    if (!sid && !lid) {
      return res.status(400).json({ message: "ต้องระบุ sid หรือ lid" });
    }

    const result = lid
      ? await notificationService.getUnreadCountLecturer(lid)
      : await notificationService.getUnreadCount(sid);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงจำนวนแจ้งเตือน" });
  }
};

// PUT /notification/:id/read — กดรายการแล้วมาร์คว่าอ่านแล้ว (ใช้ร่วมกันทั้งสองฝั่ง)
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id);
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน" });
  }
};

// PUT /notification/read-all?sid=  หรือ  ?lid=  — ปุ่ม "อ่านทั้งหมด" ใน dropdown
exports.markAllAsRead = async (req, res) => {
  try {
    const { sid, lid } = req.query;

    if (!sid && !lid) {
      return res.status(400).json({ message: "ต้องระบุ sid หรือ lid" });
    }

    if (lid) {
      await notificationService.markAllAsReadLecturer(lid);
    } else {
      await notificationService.markAllAsRead(sid);
    }

    res.json({ message: "ok" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือนทั้งหมด" });
  }
};

// DELETE /notification/clear-all?sid=  หรือ  ?lid=
// ปุ่ม "ล้างทั้งหมด" — ลบประวัติแจ้งเตือนทิ้งจริง (ต่างจาก read-all ที่แค่
// มาร์คว่าอ่านแล้วแต่ยังอยู่ในรายการ) ใช้ตอนแจ้งเตือนเยอะจนรก
exports.clearAll = async (req, res) => {
  try {
    const { sid, lid } = req.query;

    if (!sid && !lid) {
      return res.status(400).json({ message: "ต้องระบุ sid หรือ lid" });
    }

    if (lid) {
      await notificationService.clearAllLecturer(lid);
    } else {
      await notificationService.clearAllStudent(sid);
    }

    res.json({ message: "ok" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการล้างการแจ้งเตือน" });
  }
};

// test auto-reload