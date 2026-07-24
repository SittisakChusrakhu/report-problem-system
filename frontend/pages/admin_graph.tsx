import { useEffect, useMemo, useState } from "react";
import { Box, Card, Chip, Stack, Typography, Skeleton } from "@mui/material";
import {
    Inventory2Outlined,
    HourglassEmptyRounded,
    AutorenewRounded,
    TaskAltRounded,
    ErrorOutlineRounded,
    PeopleAlt,
    School,
} from "@mui/icons-material";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    LabelList,
} from "recharts";
import NavbarLayout from "../components/NavbarLayout";
import { Api } from "./api/api";

// ---------------------------------------------------------------------------
// Design tokens — extends the teal identity already set by NavbarLect
// (gradient #2F7268 -> #1F4F49) instead of introducing a new palette.
// ---------------------------------------------------------------------------
const INK = "#1E2A28";
const SUB = "#5B6B68";
const PAPER = "#E3EEEA";
const HAIRLINE = "rgba(31,79,73,0.10)";
const BRAND = "#2F7268";
const BRAND_DARK = "#1F4F49";

// ---------------------------------------------------------------------------
// Domain types (mirrors schema.prisma)
// ---------------------------------------------------------------------------
type Status = "UNASSIGNED" | "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type ProblemType = "ACADEMIC" | "FACILITY" | "ADMINISTRATIVE" | "OTHER";

interface Tag {
    id: number;
    name: string;
}

interface ProblemRecord {
    id: number;
    pro_type: ProblemType;
    status: Status;
    create_at: string;
    tags?: Tag[];
    student?: { stu_faculty?: string | null } | null;
}

const STATUS_ORDER: Status[] = ["UNASSIGNED", "PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const STATUS_META: Record<Status, { label: string; color: string }> = {
    UNASSIGNED: { label: "รอมอบหมาย", color: "#B7C3C0" },
    PENDING: { label: "รอดำเนินการ", color: "#E3A857" },
    IN_PROGRESS: { label: "กำลังดำเนินการ", color: "#4C8FA0" },
    RESOLVED: { label: "แก้ไขแล้ว", color: BRAND },
    CLOSED: { label: "ปิดเรื่อง", color: BRAND_DARK },
};

const TYPE_META: Record<ProblemType, { label: string; color: string }> = {
    ACADEMIC: { label: "วิชาการ", color: BRAND },
    FACILITY: { label: "สถานที่/อุปกรณ์", color: "#E08D79" },
    ADMINISTRATIVE: { label: "งานธุรการ", color: "#7B8FA6" },
    OTHER: { label: "อื่นๆ", color: "#B7A66F" },
};

const RANGE_OPTIONS = [
    { key: "7", label: "7 วัน" },
    { key: "30", label: "30 วัน" },
    { key: "90", label: "90 วัน" },
    { key: "all", label: "ทั้งหมด" },
] as const;
type RangeKey = (typeof RANGE_OPTIONS)[number]["key"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function cutoffFor(range: RangeKey): Date | null {
    if (range === "all") return null;
    const d = new Date();
    d.setDate(d.getDate() - Number(range));
    return d;
}

function bucketKey(date: Date, range: RangeKey): { key: string; label: string; sortKey: number } {
    if (range === "7") {
        const label = date.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit" });
        return { key: label, label, sortKey: date.getTime() - (date.getTime() % 86400000) };
    }
    if (range === "all") {
        const label = date.toLocaleDateString("th-TH", { month: "short", year: "2-digit" });
        return { key: label, label, sortKey: date.getFullYear() * 12 + date.getMonth() };
    }
    // 30 / 90 -> weekly buckets, anchored to the Monday of that week
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7; // Mon=0
    d.setDate(d.getDate() - day);
    const label = d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit" });
    return { key: label, label, sortKey: d.getTime() };
}

const CLOSED_LIKE: Status[] = ["RESOLVED", "CLOSED"];

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------
function SectionCard({ title, caption, children }: { title: string; caption?: string; children: React.ReactNode }) {
    return (
        <Card
            sx={{
                p: { xs: 2, sm: 3 },
                height: "100%",
            }}
        >
            <Typography sx={{ fontWeight: 600, fontSize: 16, color: INK }}>
                {title}
            </Typography>
            {caption && (
                <Typography sx={{ fontSize: 12.5, color: SUB, mt: 0.25, mb: 2 }}>
                    {caption}
                </Typography>
            )}
            {!caption && <Box sx={{ mb: 2 }} />}
            {children}
        </Card>
    );
}

function StatCard({
    icon,
    label,
    value,
    tint,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    tint: string;
}) {
    return (
        <Card
            sx={{
                p: 2.25,
                display: "flex",
                alignItems: "center",
                gap: 1.75,
                flex: "1 1 200px",
                minWidth: 200,
            }}
        >
            <Box
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    backgroundColor: `${tint}1A`,
                    color: tint,
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 24, color: INK, lineHeight: 1.1 }}>
                    {value}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: SUB, mt: 0.25 }}>
                    {label}
                </Typography>
            </Box>
        </Card>
    );
}

// Signature element: the problem lifecycle is a genuine ordered pipeline
// (UNASSIGNED -> ... -> CLOSED), so a segmented flow bar encodes real
// information instead of decorating the page.
function PipelineFlow({ counts, total }: { counts: Record<Status, number>; total: number }) {
    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    width: "100%",
                    height: 14,
                    borderRadius: 999,
                    overflow: "hidden",
                    backgroundColor: PAPER,
                }}
            >
                {STATUS_ORDER.map((s) => {
                    const pct = total ? (counts[s] / total) * 100 : 0;
                    return (
                        <Box
                            key={s}
                            sx={{
                                width: `${pct}%`,
                                backgroundColor: STATUS_META[s].color,
                                transition: "width 0.4s ease",
                                minWidth: pct > 0 ? 3 : 0,
                            }}
                        />
                    );
                })}
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5, mt: 2 }}>
                {STATUS_ORDER.map((s) => (
                    <Stack key={s} direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: STATUS_META[s].color }} />
                        <Typography sx={{ fontSize: 13, color: INK }}>
                            {STATUS_META[s].label}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: SUB, fontWeight: 600 }}>
                            {counts[s]}
                        </Typography>
                    </Stack>
                ))}
            </Box>
        </Box>
    );
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <Box
            sx={{
                backgroundColor: INK,
                color: "#fff",
                borderRadius: 1.5,
                px: 1.5,
                py: 1,
                fontSize: 12.5,
            }}
        >
            {label && <Box sx={{ opacity: 0.7, mb: 0.5 }}>{label}</Box>}
            {payload.map((p: any, i: number) => (
                <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: p.color || p.fill }} />
                    <span>{p.name}: {p.value}</span>
                </Box>
            ))}
        </Box>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AdminGraph() {
    const [problems, setProblems] = useState<ProblemRecord[]>([]);
    const [studentCount, setStudentCount] = useState(0);
    const [lecturerCount, setLecturerCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [range, setRange] = useState<RangeKey>("30");

    useEffect(() => {
        let cancelled = false;

        const loadData = (showSpinner: boolean) => {
            if (showSpinner) setLoading(true);
            setError(null);
            Promise.all([
                Api.get<ProblemRecord[] | { problems: ProblemRecord[] }>("/user/problem"),
                Api.get<any[]>("/student/all"),
                Api.get<any[]>("/lecturer/all"),
            ])
                .then(([problemRes, studentRes, lecturerRes]) => {
                    if (cancelled) return;
                    const data = Array.isArray(problemRes.data)
                        ? problemRes.data
                        : (problemRes.data as any)?.problems ?? [];
                    setProblems(data);
                    setStudentCount(Array.isArray(studentRes.data) ? studentRes.data.length : 0);
                    setLecturerCount(Array.isArray(lecturerRes.data) ? lecturerRes.data.length : 0);
                })
                .catch(() => {
                    if (!cancelled) setError("โหลดข้อมูลไม่สำเร็จ ลองรีเฟรชหน้านี้อีกครั้ง");
                })
                .finally(() => {
                    if (!cancelled && showSpinner) setLoading(false);
                });
        };

        loadData(true);

        const intervalId = setInterval(() => loadData(false), 30000);
        const onFocus = () => loadData(false);
        window.addEventListener("focus", onFocus);

        return () => {
            cancelled = true;
            clearInterval(intervalId);
            window.removeEventListener("focus", onFocus);
        };
    }, []);

    const filtered = useMemo(() => {
        const cutoff = cutoffFor(range);
        if (!cutoff) return problems;
        return problems.filter((p) => new Date(p.create_at) >= cutoff);
    }, [problems, range]);

    const statusCounts = useMemo(() => {
        const base = { UNASSIGNED: 0, PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 } as Record<Status, number>;
        filtered.forEach((p) => {
            if (p.status in base) base[p.status] += 1;
        });
        return base;
    }, [filtered]);

    const typeData = useMemo(() => {
        const base: Record<ProblemType, number> = { ACADEMIC: 0, FACILITY: 0, ADMINISTRATIVE: 0, OTHER: 0 };
        filtered.forEach((p) => {
            if (p.pro_type in base) base[p.pro_type] += 1;
        });
        return (Object.keys(base) as ProblemType[])
            .map((t) => ({ key: t, name: TYPE_META[t].label, value: base[t], color: TYPE_META[t].color }))
            .filter((d) => d.value > 0);
    }, [filtered]);

    const trendData = useMemo(() => {
        const map = new Map<string, { label: string; sortKey: number; open: number; closed: number }>();
        filtered.forEach((p) => {
            const d = new Date(p.create_at);
            const { key, label, sortKey } = bucketKey(d, range);
            if (!map.has(key)) map.set(key, { label, sortKey, open: 0, closed: 0 });
            const bucket = map.get(key)!;
            if (CLOSED_LIKE.includes(p.status)) bucket.closed += 1;
            else bucket.open += 1;
        });
        return Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
    }, [filtered, range]);

    const tagData = useMemo(() => {
        const counts = new Map<string, number>();
        filtered.forEach((p) => (p.tags ?? []).forEach((t) => counts.set(t.name, (counts.get(t.name) ?? 0) + 1)));
        return Array.from(counts.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [filtered]);

    const total = filtered.length;
    const resolvedRate = total ? Math.round(((statusCounts.RESOLVED + statusCounts.CLOSED) / total) * 100) : 0;

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: PAPER }}>
            <NavbarLayout />
            <Box component="main" sx={{ ml: { sm: "260px" }, p: { xs: 2, sm: 4 } }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-end" }} spacing={2} sx={{ mb: 3 }}>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 22, color: INK }}>
                            รายงานภาพรวม
                        </Typography>
                        <Typography sx={{ fontSize: 13.5, color: SUB, mt: 0.5 }}>
                            ภาพรวมแนวโน้มและสถานะการแจ้งปัญหาทั้งระบบ
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        {RANGE_OPTIONS.map((opt) => (
                            <Chip
                                key={opt.key}
                                label={opt.label}
                                onClick={() => setRange(opt.key)}
                                sx={{
                                    fontWeight: 600,
                                    fontSize: 13,
                                    backgroundColor: range === opt.key ? BRAND : "transparent",
                                    color: range === opt.key ? "#fff" : INK,
                                    border: `1px solid ${range === opt.key ? BRAND : HAIRLINE}`,
                                    "&:hover": { backgroundColor: range === opt.key ? BRAND_DARK : "rgba(47,114,104,0.08)" },
                                }}
                            />
                        ))}
                    </Stack>
                </Stack>

                {error && (
                    <Card
                        sx={{ p: 2, mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                        <ErrorOutlineRounded sx={{ color: "#C0553F" }} />
                        <Typography sx={{ fontSize: 13.5, color: INK }}>{error}</Typography>
                    </Card>
                )}

                {!loading && (
                    <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2.5 }}>
                        <StatCard icon={<PeopleAlt />} label="นักศึกษาทั้งหมด" value={String(studentCount)} tint="#4C8FA0" />
                        <StatCard icon={<School />} label="อาจารย์ทั้งหมด" value={String(lecturerCount)} tint="#7B8FA6" />
                    </Stack>
                )}

                {loading ? (
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} variant="rounded" width={220} height={80} sx={{ borderRadius: 3 }} />
                            ))}
                        </Stack>
                        <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                            <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3, flex: 1 }} />
                            <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3, flex: 1 }} />
                        </Stack>
                    </Stack>
                ) : total === 0 ? (
                    <Card sx={{ p: 5, textAlign: "center" }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 16, color: INK }}>
                            ยังไม่มีข้อมูลในช่วงเวลานี้
                        </Typography>
                        <Typography sx={{ fontSize: 13.5, color: SUB, mt: 0.5 }}>
                            ลองเปลี่ยนช่วงเวลาเป็น "ทั้งหมด" เพื่อดูรายงานย้อนหลัง
                        </Typography>
                    </Card>
                ) : (
                    <Stack spacing={2.5}>
                        {/* KPI row */}
                        <Stack direction="row" flexWrap="wrap" gap={2}>
                            <StatCard icon={<Inventory2Outlined />} label="ปัญหาทั้งหมด" value={String(total)} tint={BRAND} />
                            <StatCard icon={<HourglassEmptyRounded />} label="รอมอบหมาย" value={String(statusCounts.UNASSIGNED)} tint="#8A9895" />
                            <StatCard icon={<AutorenewRounded />} label="กำลังดำเนินการ" value={String(statusCounts.IN_PROGRESS)} tint="#4C8FA0" />
                            <StatCard icon={<TaskAltRounded />} label="อัตราแก้ไขสำเร็จ" value={`${resolvedRate}%`} tint={BRAND_DARK} />
                        </Stack>

                        {/* Pipeline signature element */}
                        <SectionCard title="สถานะปัญหาในระบบ" caption="สัดส่วนปัญหาทั้งหมดตามลำดับขั้นตอนการดำเนินการ">
                            <PipelineFlow counts={statusCounts} total={total} />
                        </SectionCard>

                        {/* Type donut + trend */}
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} alignItems="stretch">
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <SectionCard title="ประเภทปัญหา" caption="สัดส่วนแยกตามหมวดหมู่">
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Box sx={{ width: 160, height: 160, flexShrink: 0 }}>
                                            <ResponsiveContainer>
                                                <PieChart>
                                                    <Pie data={typeData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2}>
                                                        {typeData.map((d) => (
                                                            <Cell key={d.key} fill={d.color} stroke="none" />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<CustomTooltip />} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </Box>
                                        <Stack spacing={1} sx={{ minWidth: 0 }}>
                                            {typeData.map((d) => (
                                                <Stack key={d.key} direction="row" alignItems="center" spacing={1}>
                                                    <Box sx={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: d.color, flexShrink: 0 }} />
                                                    <Typography sx={{ fontSize: 13, color: INK, whiteSpace: "nowrap" }}>
                                                        {d.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 13, color: SUB, fontWeight: 600 }}>
                                                        {d.value}
                                                    </Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Box>
                                </SectionCard>
                            </Box>

                            <Box sx={{ flex: 1.4, minWidth: 0 }}>
                                <SectionCard title="แนวโน้มการแจ้งปัญหา" caption="จำนวนปัญหาที่แจ้งเข้ามา แบ่งตามสถานะปัจจุบัน (เปิดอยู่ / ปิดแล้ว)">
                                    <Box sx={{ width: "100%", height: 200 }}>
                                        <ResponsiveContainer>
                                            <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="openFill" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#E3A857" stopOpacity={0.5} />
                                                        <stop offset="100%" stopColor="#E3A857" stopOpacity={0.03} />
                                                    </linearGradient>
                                                    <linearGradient id="closedFill" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor={BRAND} stopOpacity={0.55} />
                                                        <stop offset="100%" stopColor={BRAND} stopOpacity={0.03} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid vertical={false} stroke={HAIRLINE} />
                                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: SUB }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 11, fill: SUB }} axisLine={false} tickLine={false} allowDecimals={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area type="monotone" dataKey="closed" name="ปิดแล้ว" stackId="1" stroke={BRAND} fill="url(#closedFill)" strokeWidth={2} />
                                                <Area type="monotone" dataKey="open" name="เปิดอยู่" stackId="1" stroke="#E3A857" fill="url(#openFill)" strokeWidth={2} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </SectionCard>
                            </Box>
                        </Stack>

                        {/* Top tags */}
                        {tagData.length > 0 && (
                            <SectionCard title="แท็กที่พบบ่อย" caption="6 แท็กที่ถูกใช้มากที่สุดในช่วงเวลานี้">
                                <Box sx={{ width: "100%", height: Math.max(140, tagData.length * 38) }}>
                                    <ResponsiveContainer>
                                        <BarChart data={tagData} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                                            <XAxis type="number" hide allowDecimals={false} />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                width={110}
                                                tick={{ fontSize: 12.5, fill: INK }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(47,114,104,0.06)" }} />
                                            <Bar dataKey="value" name="จำนวน" fill={BRAND} radius={[0, 6, 6, 0]} barSize={16}>
                                                <LabelList dataKey="value" position="right" style={{ fontSize: 12, fill: INK }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </SectionCard>
                        )}
                    </Stack>
                )}
            </Box>
        </Box>
    );
}