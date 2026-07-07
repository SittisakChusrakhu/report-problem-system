import React, { useEffect, useState } from "react";
import { Api } from "../pages/api/api";
import styles from "../styles/Home.module.css";

interface Props {}

interface Problem {
  id: string;
  pro_title: string;
  pro_type: string;
  pro_desc: string;
  pro_image: string;
  lecturerId: number | null;
  sid: string;
  create_at: string;
  status: string;
}

const monthNames = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const ProblemCountComponent: React.FC<Props> = () => {
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth()
  );
  const [currentMonthProblemCount, setCurrentMonthProblemCount] =
    useState<number>(0);
  const [totalProblemCount, setTotalProblemCount] = useState<number>(0);
  const [percentageChange, setPercentageChange] = useState<number>(0);
  const [problemCount, setProblemCount] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lid = localStorage.getItem("rid");
        const response = await Api.get(`/user/problem/?lid=${lid}`);
        const problemData: Problem[] = response.data;

        // โค้ดสำหรับเรียกค่าจำนวนปัญหาในเดือนปัจจุบัน
        const currentMonthProblems = problemData.filter((problem) => {
          const problemMonth = new Date(problem.create_at).getMonth();
          const problemYear = new Date(problem.create_at).getFullYear();
          const currentYear = new Date().getFullYear();
          return problemMonth === currentMonth && problemYear === currentYear;
        });
        const currentMonthCount = currentMonthProblems.length;
        setCurrentMonthProblemCount(currentMonthCount);

        // โค้ดสำหรับเรียกค่าจำนวนปัญหาทั้งหมด
        const totalCount = problemData.length;
        setTotalProblemCount(totalCount);

        // โค้ดสำหรับเรียกค่าปัญหาในวันนี้
        const todayProblems = problemData.filter((problem: Problem) => {
          const problemDate = new Date(problem.create_at);
          const today = new Date();
          return (
            problemDate.getDate() === today.getDate() &&
            problemDate.getMonth() === today.getMonth() &&
            problemDate.getFullYear() === today.getFullYear()
          );
        });
        const count = todayProblems.length;
        setProblemCount(count);
        const percentage = (count / totalCount) * 100;
        setPercentage(percentage);
        setTotalCount(totalCount);

        // โค้ดสำหรับคำนวณเปอร์เซ็นต์การเปลี่ยนแปลงจากเดือนก่อนหน้า
        const previousMonth = currentMonth - 1 >= 0 ? currentMonth - 1 : 11;
        const previousMonthProblems = problemData.filter((problem) => {
          const problemMonth = new Date(problem.create_at).getMonth();
          const problemYear = new Date(problem.create_at).getFullYear();
          const currentYear = new Date().getFullYear();
          return problemMonth === previousMonth && problemYear === currentYear;
        });
        const previousMonthCount = previousMonthProblems.length;
        const percentageChange =
          previousMonthCount !== 0
            ? ((currentMonthCount - previousMonthCount) / previousMonthCount) *
              100
            : 0;
        setPercentageChange(percentageChange);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    const previousMonth = currentMonth - 1 >= 0 ? currentMonth - 1 : 11;
    setCurrentMonth(previousMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = currentMonth + 1 <= 11 ? currentMonth + 1 : 0;
    setCurrentMonth(nextMonth);
  };

  const getIcon = () => {
    if (percentageChange > 0) {
      return <span className={styles.icon}>&#9650;</span>; // ไอคอนเพิ่มขึ้น (↑)
    } else if (percentageChange < 0) {
      return <span className={styles.icon}>&#9660;</span>; // ไอคอนลดลง (↓)
    } else {
      return null; // ไม่แสดงไอคอนเมื่อไม่มีการเปลี่ยนแปลง
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardItem}>
        <p className={styles.dashboardItemLabel}>
          เปอร์เซ็นต์การเปลี่ยนแปลงจากเดือนก่อนหน้า
        </p>
        <p className={styles.dashboardItemValue}>
          {getIcon()}
          {Math.abs(percentageChange).toFixed(2)}%
        </p>
        <p className={styles.dashboardItemValue}></p>
      </div>
      <div className={styles.dashboardItem}>
        <div className={styles.monthSelector}>
          <button className={styles.monthButton} onClick={handlePreviousMonth}>
            &lt;
          </button>
          <p className={styles.monthName}>{monthNames[currentMonth]}</p>
          <button className={styles.monthButton} onClick={handleNextMonth}>
            &gt;
          </button>
        </div>
        <p className={styles.dashboardItemLabel}>จำนวนปัญหาในเดือนปัจจุบัน</p>
        <p className={styles.dashboardItemValue}>
          {currentMonthProblemCount} ปัญหา
        </p>
      </div>
      <div className={styles.dashboardItem}>
        <p className={styles.dashboardItemLabel}>
          จำนวนปัญหาที่เกิดขึ้นในวันนี้
        </p>
        <p className={styles.dashboardItemValue}>{problemCount} ปัญหา</p>
        <p className={styles.dashboardItemValue}></p>
      </div>
      <div className={styles.dashboardItem}>
        <p className={styles.dashboardItemLabel}>จำนวนปัญหาทั้งหมด</p>
        <p className={styles.dashboardItemValue}>{totalCount} ปัญหา</p>
        <p className={styles.dashboardItemValue}></p>
      </div>
    </div>
  );
};

export default ProblemCountComponent;
