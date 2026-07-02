import React, { useEffect, useRef, useState } from "react";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import Chart from "chart.js/auto";
import { ChartTypeRegistry } from 'chart.js/auto';
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import axios from "axios";
import { SelectChangeEvent } from '@mui/material';

dayjs.extend(customParseFormat);

interface Problem {
    id: string;
    pro_title: string;
    pro_type: string;
    pro_desc: string;
    pro_image: string;
    lect_id: string;
    sid: string;
    datetime: string;
    status: string;
}

interface Props { }

export default function ChartComponent(props: Props) {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart | null>(null);
    const [data, setData] = useState<{
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
    const [xAxesOption, setXAxesOption] = useState("MM/YYYY");
    const [yAxesOption, setYAxesOption] = useState("Problem Count");
    const [selectedChartType, setSelectedChartType] = useState("Line Chart");
    dayjs.locale("th");

    useEffect(() => {
        const fetchData = async (selectedOption: string) => {
            try {
                const lid = localStorage.getItem("rid");
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/user/problem/?lid=${lid}&axes=${selectedOption}`
                );
                const problemData: Problem[] = response.data;
                const startDate = dayjs().subtract(1, "year");
                const filteredData = problemData.filter((problem: Problem) =>
                    dayjs(problem.datetime).isAfter(startDate)
                );

                const groupedData = filteredData.reduce(
                    (result: Record<string, number>, problem: Problem) => {
                        const date = dayjs(problem.datetime).format(selectedOption);
                        if (!result[date]) {
                            result[date] = 0;
                        }
                        if (problem.status === "ได้รับการแก้ปัญหาแล้ว") {
                            result[date]++;
                        } else if (problem.status === "การแจ้งปัญหาถูกปฏิเสธ") {
                            const rejectedDate = `Rejected ${date}`;
                            if (!result[rejectedDate]) {
                                result[rejectedDate] = 0;
                            }
                            result[rejectedDate]++;
                        } else if (problem.status === "กำลังส่งเรื่อง") {
                            const sendingDate = `Sending ${date}`;
                            if (!result[sendingDate]) {
                                result[sendingDate] = 0;
                            }
                            result[sendingDate]++;
                        }
                        return result;
                    },
                    {}
                );

                const labels = Object.keys(groupedData).filter(
                    (label) => !label.startsWith("Rejected") && !label.startsWith("Sending ")
                );
                const successData = labels.map((label) => groupedData[label]);
                const rejectedData = labels.map(
                    (label) => groupedData[`Rejected ${label}`] || 0
                );
                const sendingData = labels.map(
                    (label) => groupedData[`Sending ${label}`] || 0
                );

                setData({ labels, successData, rejectedData, sendingData });
            } catch (error) {
                console.log(error);
            }
        };

        fetchData(xAxesOption);


    }, [xAxesOption]);

    useEffect(() => {
        if (chartRef.current && data.labels.length) {
            const ctx = chartRef.current.getContext("2d");
            if (ctx) {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }
    
                let chartType: keyof ChartTypeRegistry = "bar";
                if (selectedChartType === "Line Chart") {
                    chartType = "line";
                } 
    
                chartInstance.current = new Chart(ctx, {
                    type: chartType,
                    data: {
                        labels: data.labels,
                        datasets: [
                            {
                                label: "ได้รับการแก้ปัญหาแล้ว",
                                data: data.successData,
                                backgroundColor: "RGBA( 144, 238, 144, 0.2 )",
                                borderColor: "RGBA( 144, 238, 144, 1 )",
                                borderWidth: 1,
                            },
                            {
                                label: "กำลังส่งเรื่อง",
                                data: data.sendingData,
                                backgroundColor: "rgba(255, 255, 0, 0.2)",
                                borderColor: "rgba(255, 255, 0, 1)",
                                borderWidth: 1,
                            },
                            {
                                label: "การแจ้งปัญหาถูกปฏิเสธ",
                                data: data.rejectedData,
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
                                stacked: true,
                                title: {
                                    display: true,
                                    text: yAxesOption,
                                },
                            },
                            x: {
                                beginAtZero: true,
                                stacked: true,
                                title: {
                                    display: true,
                                  
                                },
                            },
                        },
                    },
                });
            }
        }
    }, [
        chartRef,
        data.labels,
        data.successData,
        data.rejectedData,
        data.sendingData,
        xAxesOption,
        yAxesOption,
        selectedChartType,
    ]);
    

    const handleXAxesChange = (event: SelectChangeEvent<string>) => {
        const selectedValue = event.target.value;
        console.log(selectedValue);
        let formattedValue = selectedValue;

        if (selectedValue === "Year") {
            formattedValue = "YYYY";
        } else if (selectedValue === "Month") {
            formattedValue = "MM/YYYY";
        } else if (selectedValue === "Day") {
            formattedValue = "DD/MM";
        }

        setXAxesOption(formattedValue);
    };

    const handleChartTypeChange = (event: SelectChangeEvent<string>) => {
        const value: string = event.target.value;
        setSelectedChartType(value);
    };

    return (
        <div style={{ position: "relative" }}>
            <canvas ref={chartRef}></canvas>
            <div
                style={{
                    position: "sticky",
                    top: "0",
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    backgroundColor: "white",
                    padding: "10px 0",
                }}
            >
                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                        <InputLabel id="xAxesOption-label">DateTime:</InputLabel>
                        <Select
                            labelId="xAxesOption-label"
                            id="xAxesOption"
                            value={xAxesOption}
                            onChange={handleXAxesChange}
                            label="X-Axis"
                        >
                            <MenuItem value="DD/MM">Day</MenuItem>
                            <MenuItem value="MM/YYYY">Month</MenuItem>
                            <MenuItem value="ํYYYY">Year</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                        <InputLabel id="chartType-label">Chart Type:</InputLabel>
                        <Select
                            labelId="chartType-label"
                            id="chartType"
                            value={selectedChartType}
                            onChange={handleChartTypeChange}
                            label="Chart Type"
                        >
                            <MenuItem value="Bar Chart">Bar Chart</MenuItem>
                            <MenuItem value="Line Chart">Line Chart</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            </div>
       

    );
}
