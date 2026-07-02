import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart, ChartConfiguration } from "chart.js";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

interface Props {}

interface Problem {
  id: string;
  pro_title: string;
  pro_type: string;
  pro_desc: string;
  pro_image: string;
  lect_id: string;
  sid: string;
  datetime: string;
  course?: string;
  status?: string;
  tag?: string;
}

interface DataState {
  [key: string]: number;
}

const ProblemTypeChart: React.FC<Props> = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart<"pie", number[], unknown> | null>(null);
  const [data, setData] = useState<DataState>({});
  const [selectedFunction, setSelectedFunction] = useState<"status" | "pro_type">(
    "status"
  );

  const fetchData = async () => {
    try {
      const lid = localStorage.getItem("rid");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/user/problem/?lid=${lid}`
      );
      const problemData: Problem[] = response.data;
      updateChart(problemData);
    } catch (error) {
      console.log(error);
    }
  };

  const updateChart = (problemData: Problem[]) => {
    const newData: DataState = {};
    if (selectedFunction === "status") {
      const successCount = problemData.filter(
        (problem) => problem.status === "ได้รับการแก้ปัญหาแล้ว"
      ).length;
      const rejectedCount = problemData.filter(
        (problem) => problem.status === "การแจ้งปัญหาถูกปฏิเสธ"
      ).length;
      const sendingCount = problemData.filter(
        (problem) => problem.status === "กำลังส่งเรื่อง"
      ).length;

      const totalCount = successCount + rejectedCount + sendingCount;
      newData.successPercentage = (successCount / totalCount) * 100;
      newData.rejectedPercentage = (rejectedCount / totalCount) * 100;
      newData.sendingPercentage = (sendingCount / totalCount) * 100;
    } else if (selectedFunction === "pro_type") {
      const problemCountByType: DataState = problemData.reduce(
        (count: DataState, problem) => {
          const type = problem.pro_type;
          count[type] = (count[type] || 0) + 1;
          return count;
        },
        {}
      );

      const totalValues = Object.values(problemCountByType).reduce(
        (sum, value) => sum + value,
        0
      );

      for (const type in problemCountByType) {
        if (
          typeof problemCountByType[type] === "number" &&
          totalValues !== 0
        ) {
          newData[type] = (problemCountByType[type] / totalValues) * 100;
        }
      }
    }

    setData(newData);
  };

  useEffect(() => {
    fetchData();
  }, [selectedFunction]);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        const chartConfig: ChartConfiguration<"pie", number[], string> = {
          type: "pie",
          data: {
            labels:
              selectedFunction === "status"
                ? ["ได้รับการแก้ปัญหาแล้ว", "กำลังส่งเรื่อง", "การแจ้งปัญหาถูกปฏิเสธ"]
                : Object.keys(data),
            datasets: [
              {
                data:
                  selectedFunction === "status"
                    ? [
                        data.successPercentage || 0,
                        data.sendingPercentage || 0,
                        data.rejectedPercentage || 0,
                      ]
                    : Object.values(data),
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
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const labelIndex = context.dataIndex;
                    const percentage = (() => {
                      if (selectedFunction === "status") {
                        const successPercentage = data.successPercentage || 0;
                        const rejectedPercentage = data.rejectedPercentage || 0;
                        const sendingPercentage = data.sendingPercentage || 0;
                        if (
                          typeof successPercentage === "number" &&
                          typeof rejectedPercentage === "number" &&
                          typeof sendingPercentage === "number"
                        ) {
                          if (labelIndex === 0) {
                            return successPercentage.toFixed(2);
                          } else if (labelIndex === 1) {
                            return sendingPercentage.toFixed(2);
                          } else if (labelIndex === 2) {
                            return rejectedPercentage.toFixed(2);
                          }
                        }
                      } else {
                        const totalValues = Object.values(data).reduce(
                          (sum, value) => sum + value,
                          0
                        );
                        if (
                          typeof data[context.label] === "number" &&
                          totalValues !== 0
                        ) {
                          return (
                            (data[context.label] / totalValues) * 100
                          ).toFixed(2);
                        }
                      }
                      return "0";
                    })();
                    return `${context.label}: ${percentage}%`;
                  },
                  afterLabel: (tooltipItem) => {
                    return `Align: left;`;
                  },
                },
              },
            },
          },
        };
        chartInstance.current = new Chart(ctx, chartConfig);
      }
    }
  }, [data, selectedFunction]);

  return (
    <div >
      <canvas ref={chartRef} style={{width: "280px", height: "250px"}}></canvas>
      <FormControl>
        <InputLabel id="function-label">Function</InputLabel>
        <Select
          labelId="function-label"
          value={selectedFunction}
          onChange={(e) => setSelectedFunction(e.target.value as "status" | "pro_type")}
        >
          <MenuItem value="status">Show data by status</MenuItem>
          <MenuItem value="pro_type">Show data by type</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default ProblemTypeChart;
