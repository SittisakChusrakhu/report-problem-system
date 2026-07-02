import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js';
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import axios from "axios";

dayjs.extend(customParseFormat);

const MyChartComponent = () => {
  const [chartData, setChartData] = useState<{
    labels: string[];
    successData: number[];
    rejectedData: number[];
    sendingData: number[];
}>({
    labels: [],
    successData: [],
    rejectedData: [],
    sendingData: [],
});
  const [pieData, setPieData] = useState<{
    successPercentage: number;
    rejectedPercentage: number;
    sendingPercentage: number;
}>({
    successPercentage: 0,
    rejectedPercentage: 0,
    sendingPercentage: 0,
});

const [xAxesOption, setXAxesOption] = useState("DD/MM");
const [yAxesOption, setYAxesOption] = useState("Problem Count");
const [selectedChartType, setSelectedChartType] = useState("Bar Chart");
dayjs.locale("th");
    

  useEffect(() => {
    // Fetch chart data from API endpoint
    const fetchChartData = async () => {
      // โค้ดสำหรับเรียก API เพื่อรับข้อมูลสำหรับแผนภูมิ
      const lid = localStorage.getItem("rid");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/user/problem/?lid=${lid}`);
      const data = await response.json();
      setChartData(data);
    };

    // Fetch pie chart data from API endpoint
    const fetchPieData = async () => {
      // โค้ดสำหรับเรียก API เพื่อรับข้อมูลสำหรับกราฟวงกลม
      const lid = localStorage.getItem("rid");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/user/problem/?lid=${lid}`);
      const data = await response.json();
      setPieData(data);
    };

    fetchChartData();
    fetchPieData();
  }, []);


  const element = document.getElementById('elementId') as any;
if (element !== null) {
  // Safely use the element here
  element.doSomething();
} else {
  console.log('Element not found');
}


useEffect(() => {
    // Create and update the chart
    const canvas = document.getElementById('chartCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: "ได้รับการแก้ปัญหาแล้ว",
                    data: chartData.successData,
                    backgroundColor: "RGBA( 144, 238, 144, 0.2 )",
                    borderColor: "RGBA( 144, 238, 144, 1 )",
                    borderWidth: 1,
                },
                {
                    label: "กำลังส่งเรื่อง",
                    data: chartData.sendingData,
                    backgroundColor: "rgba(255, 255, 0, 0.2)",
                    borderColor: "rgba(255, 255, 0, 1)",
                    borderWidth: 1,
                },
                {
                    label: "การแจ้งปัญหาถูกปฏิเสธ",
                    data: chartData.rejectedData,
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: yAxesOption,
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: xAxesOption,
                    },
                },
            },
        },
      });
    }
  }, [chartData]);
  
  useEffect(() => {
    // Create and update the pie chart
    const canvas = document.getElementById('pieCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
    if (ctx) {
      new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ["ได้รับการแก้ปัญหาแล้ว", "กำลังส่งเรื่อง", "การแจ้งปัญหาถูกปฏิเสธ"],
            datasets: [
                {
                    data: [
                        pieData.successPercentage,
                        pieData.sendingPercentage,
                        pieData.rejectedPercentage,
                    ],
                    backgroundColor: [
                        "RGBA( 144, 238, 144, 0.2 )",
                        "rgba(255, 255, 0, 0.2)",
                        "rgba(255, 99, 132, 0.2)",
                    ],
                    borderColor: [
                        "RGBA( 144, 238, 144, 1 )",
                        "rgba(255, 255, 0, 1)",
                        "rgba(255, 99, 132, 1)",
                    ],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const labelIndex = context.dataIndex;
                            const percentage = (() => {
                                if (labelIndex === 0) {
                                    return pieData.successPercentage.toFixed(2);
                                } else if (labelIndex === 1) {
                                    return pieData.sendingPercentage.toFixed(2);
                                } else if (labelIndex === 2) {
                                    return pieData.rejectedPercentage.toFixed(2);
                                }
                                return "";
                            })();
                            return `${context.label}: ${percentage}%`;
                        },
                        afterLabel: (tooltipItem: any) => {
                            return `Align: left`;
                        },
                    },
                },
            },
        },
      });
    }
  }, [pieData]);
  
  

  return (
    <div>
      <canvas id="chartCanvas" width="400" height="200"></canvas>
      <canvas id="pieCanvas" width="400" height="200"></canvas>
    </div>
  );
};

export default MyChartComponent;
