import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import axios from "axios";

dayjs.extend(customParseFormat);

interface Props { }

export default function ChartComponent(props: Props) {
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
    const [xAxesOption, setXAxesOption] = useState("Day");
    const [yAxesOption, setYAxesOption] = useState("Problem Count");

    dayjs.locale("th");

    useEffect(() => {
        const fetchData = async (selectedOption: string) => {
            try {
                const lid = localStorage.getItem("rid");
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/user/problem/?lid=${lid}&axes=${selectedOption}`
                );
                const problemData: Problem[] = response.data;
                const startDate = dayjs().subtract(5, "month");
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
                chartInstance.current = new Chart(ctx, {
                    type: "bar",
                    data: {
                        labels: data.labels,
                        datasets: [
                            {
                                label: "ได้รับการแก้ปัญหาแล้ว",
                                data: data.successData, // Use data.successData
                                backgroundColor: "RGBA( 144, 238, 144, 0.2 )",
                                borderColor: "RGBA( 144, 238, 144, 1 )",
                                borderWidth: 1,
                            },
                            {
                                label: "กำลังส่งเรื่อง",
                                data: data.sendingData, // Use data.sendingData
                                backgroundColor: "rgba(255, 255, 0, 0.2)",
                                borderColor: "rgba(255, 255, 0, 1)",
                                borderWidth: 1,
                            },
                            {
                                label: "การแจ้งปัญหาถูกปฏิเสธ",
                                data: data.rejectedData, // Use data.rejectedData
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

        }
    }, [
        chartRef,
        data.labels,
        data.successData,
        data.rejectedData,
        data.sendingData,
        xAxesOption,
        yAxesOption,
    ]);
    const handleXAxesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        let formattedValue = selectedValue;
        if (selectedValue === "Month") {
            formattedValue = "MM";
        } else if (selectedValue === "Year") {
            formattedValue = "YYYY";
        } else if (selectedValue === "Day") {
            formattedValue = "DD/MM";
        }
        setXAxesOption(formattedValue);
        // Update the select option value with the newly selected value
        event.target.value = formattedValue;
    };

    const handleYAxesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setYAxesOption(event.target.value);
    };

    const formatDate = (datetime: string) => {
        const date = dayjs(datetime);
        const formattedDate = date.format("DD/MM/YYYY");
        return formattedDate;
    };

    return (
        <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <canvas ref={chartRef} id="myChart" width="100" height="50"></canvas>
            <div>
                <label htmlFor="xAxesSelect">Select Datetime </label>
                <select id="xAxesSelect" value={xAxesOption} onChange={handleXAxesChange}>
                    <option value="Month">Month</option>
                    <option value="Year">Year</option>
                    <option value="Day">Day</option>
                </select>
            </div>
        </div>

            {/* Rest of the JSX */ }
        </div >
    );
}