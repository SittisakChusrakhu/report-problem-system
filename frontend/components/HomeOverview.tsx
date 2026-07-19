import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Box, Button, Card, Chip, Skeleton, Stack, Typography } from "@mui/material";
import {
    AddRounded,
    ArrowForwardRounded,
    ErrorOutlineRounded,
    LocalOfferOutlined,
    AddCircleOutline,
    ListAltOutlined,
    EditOutlined,
    InsightsOutlined,
    ScheduleOutlined,
} from "@mui/icons-material";
import { Api } from "../pages/api/api";

// ---------------------------------------------------------------------------
// Shared design tokens — same identity as lect_graph.tsx so the app reads as
// one product, not a patchwork of pages. PAPER is a sage tint pulled from
// BRAND (not a generic gray/cream) so it stays "in family" with the rest of
// the app while sitting easier on the eyes than a near-white background.
// ---------------------------------------------------------------------------
const INK = "#1E2A28";
const SUB = "#5B6B68";
const PAPER = "#E3EEEA";
const PAPER_WASH = "rgba(47,114,104,0.08)";
const HAIRLINE = "rgba(31,79,73,0.10)";
const BRAND = "#2F7268";
const BRAND_DARK = "#1F4F49";

const TAG_PALETTE = [BRAND, "#E08D79", "#4C8FA0", "#7B8FA6", "#E3A857", "#B7A66F"];

type Status = "UNASSIGNED" | "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

const STATUS_META: Record<Status, { label: string; color: string }> = {
    UNASSIGNED: { label: "รอมอบหมาย", color: "#8A9895" },
    PENDING: { label: "รอดำเนินการ", color: "#E3A857" },
    IN_PROGRESS: { label: "กำลังดำเนินการ", color: "#4C8FA0" },
    RESOLVED: { label: "แก้ไขแล้ว", color: BRAND },
    CLOSED: { label: "ปิดเรื่อง", color: BRAND_DARK },
};

interface Tag {
    id: number;
    name: string;
}

interface Problem {
    id: string;
    pro_title: string;
    pro_desc: string;
    tags: Tag[];
    status: Status;
    create_at: string;
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "สวัสดีตอนเช้า";
    if (h < 17) return "สวัสดีตอนบ่าย";
    if (h < 20) return "สวัสดีตอนเย็น";
    return "สวัสดี";
}

function timeAgo(dateStr: string) {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return "เมื่อสักครู่";
    if (min < 60) return `${min} นาทีที่แล้ว`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} ชั่วโมงที่แล้ว`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day} วันที่แล้ว`;
    return new Date(dateStr).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit" });
}

function StatPill({ value, label, tint }: { value: string; label: string; tint: string }) {
    return (
        <Card
            sx={{
                p: 2,
                flex: "1 1 150px",
                minWidth: 150,
                borderLeft: `3px solid ${tint}`,
            }}
        >
            <Typography sx={{ fontWeight: 700, fontSize: 26, color: INK, lineHeight: 1.1 }}>
                {value}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: SUB, mt: 0.5 }}>{label}</Typography>
        </Card>
    );
}

function QuickActionCard({
    icon,
    label,
    href,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    href: string;
    onClick: (href: string) => void;
}) {
    return (
        <Card
            onClick={() => onClick(href)}
            sx={{
                p: 2,
                flex: "1 1 160px",
                minWidth: 160,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
                "&:hover": { boxShadow: "0 8px 24px rgba(31,79,73,0.10)", transform: "translateY(-2px)" },
            }}
        >
            <Box
                sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    backgroundColor: `${BRAND}14`,
                    color: BRAND,
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: INK }}>
                {label}
            </Typography>
        </Card>
    );
}

interface HomeOverviewProps {
    role: "student" | "lecturer";
    navbar: React.ReactNode;
}

export default function HomeOverview({ role, navbar }: HomeOverviewProps) {
    const router = useRouter();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Preserves the /tags fetch order as a stable tie-break for the trending
    // sort below — kept in a ref since it's read once per fetch, not rendered.
    const tagOrderRef = useRef<string[]>([]);

    useEffect(() => {
        let cancelled = false;

        const loadData = (showSpinner: boolean) => {
            if (showSpinner) setLoading(true);
            setError(null);
            Promise.all([Api.get<Problem[]>("/user/problem"), Api.get<Tag[]>("/tags")])
                .then(([problemRes, tagRes]) => {
                    if (cancelled) return;
                    const problemData = Array.isArray(problemRes.data) ? problemRes.data : [];
                    tagOrderRef.current = Array.isArray(tagRes.data) ? tagRes.data.map((t) => t.name) : [];
                    setProblems(problemData);
                })
                .catch(() => {
                    if (!cancelled) setError("โหลดข้อมูลไม่สำเร็จ ลองรีเฟรชหน้านี้อีกครั้ง");
                })
                .finally(() => {
                    if (!cancelled && showSpinner) setLoading(false);
                });
        };

        loadData(true);

        // Keep the snapshot current without the user manually reloading:
        // poll in the background, and refetch immediately when the tab
        // regains focus (e.g. switching back after submitting a report).
        // Silent refetches (showSpinner=false) skip the loading skeleton
        // so the page doesn't flicker every 30s.
        const intervalId = setInterval(() => loadData(false), 30000);
        const onFocus = () => loadData(false);
        window.addEventListener("focus", onFocus);

        return () => {
            cancelled = true;
            clearInterval(intervalId);
            window.removeEventListener("focus", onFocus);
        };
    }, []);

    const stats = useMemo(() => {
        const total = problems.length;
        const open = problems.filter((p) => p.status === "UNASSIGNED" || p.status === "PENDING" || p.status === "IN_PROGRESS").length;
        const done = total - open;
        return { total, open, done, rate: total ? Math.round((done / total) * 100) : 0 };
    }, [problems]);

    const trending = useMemo(() => {
        const grouped = new Map<string, Problem[]>();
        problems.forEach((p) => {
            (p.tags ?? []).forEach((tag) => {
                const list = grouped.get(tag.name) ?? [];
                list.push(p);
                grouped.set(tag.name, list);
            });
        });
        const tagOrder = tagOrderRef.current;
        return Array.from(grouped.entries())
            .sort((a, b) => {
                const diff = b[1].length - a[1].length;
                if (diff !== 0) return diff;
                return tagOrder.indexOf(a[0]) - tagOrder.indexOf(b[0]);
            })
            .slice(0, 3)
            .map(([name, list], i) => ({
                name,
                count: list.length,
                sample: list[0],
                color: TAG_PALETTE[i % TAG_PALETTE.length],
            }));
    }, [problems]);

    const recentActivity = useMemo(() => {
        return [...problems]
            .sort((a, b) => new Date(b.create_at).getTime() - new Date(a.create_at).getTime())
            .slice(0, 5);
    }, [problems]);

    const copy =
        role === "student"
            ? {
                  subtitle: "ภาพรวมปัญหาที่นักศึกษาพบบ่อยที่สุดในระบบตอนนี้",
                  ctaLabel: "แจ้งปัญหาใหม่",
                  ctaHref: "/stu_report",
                  browseLabel: "ดูรายงานทั้งหมด",
                  browseHref: "/stu_listreport",
                  statLabels: { total: "ปัญหาที่แจ้งไปแล้ว", open: "กำลังรอดำเนินการ", rate: "อัตราแก้ไขสำเร็จ" },
                  quickActions: [
                      { label: "แจ้งปัญหาใหม่", href: "/stu_report", icon: <AddCircleOutline sx={{ fontSize: 20 }} /> },
                      { label: "ดูรายงานของฉัน", href: "/stu_listreport", icon: <ListAltOutlined sx={{ fontSize: 20 }} /> },
                      { label: "แก้ไขข้อมูลส่วนตัว", href: "/stu_edit", icon: <EditOutlined sx={{ fontSize: 20 }} /> },
                  ],
              }
            : {
                  subtitle: "ภาพรวมปัญหาที่ต้องดำเนินการและหัวข้อที่พบบ่อยในระบบ",
                  ctaLabel: "ดูสรุปข้อมูลเชิงลึก",
                  ctaHref: "/lect_graph",
                  browseLabel: "ดูรายงานนักศึกษา",
                  browseHref: "/lect_read",
                  statLabels: { total: "ปัญหาทั้งหมดในระบบ", open: "รอดำเนินการ", rate: "อัตราแก้ไขสำเร็จ" },
                  quickActions: [
                      { label: "ดูรายงานนักศึกษา", href: "/lect_read", icon: <ListAltOutlined sx={{ fontSize: 20 }} /> },
                      { label: "ดูสรุปข้อมูลเชิงลึก", href: "/lect_graph", icon: <InsightsOutlined sx={{ fontSize: 20 }} /> },
                      { label: "แก้ไขข้อมูลส่วนตัว", href: "/lect_edit", icon: <EditOutlined sx={{ fontSize: 20 }} /> },
                  ],
              };

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: PAPER }}>
            {navbar}
            <Box
                component="main"
                sx={{
                    ml: { sm: "260px" },
                    p: { xs: 2, sm: 4 },
                    background: `radial-gradient(1100px 320px at 15% -10%, ${PAPER_WASH}, transparent 65%)`,
                }}
            >
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ sm: "center" }}
                    spacing={2}
                    sx={{ mb: 3 }}
                >
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 22, color: INK }}>
                            {getGreeting()} 👋
                        </Typography>
                        <Typography sx={{ fontSize: 13.5, color: SUB, mt: 0.5 }}>
                            {copy.subtitle}
                        </Typography>
                    </Box>
                    <Button
                        onClick={() => router.push(copy.ctaHref)}
                        endIcon={role === "student" ? <AddRounded /> : <ArrowForwardRounded />}
                        sx={{
                            fontWeight: 600,
                            fontSize: 13.5,
                            textTransform: "none",
                            borderRadius: 999,
                            px: 2.5,
                            py: 1,
                            backgroundColor: BRAND,
                            color: "#fff",
                            "&:hover": { backgroundColor: BRAND_DARK },
                        }}
                    >
                        {copy.ctaLabel}
                    </Button>
                </Stack>

                {error && (
                    <Card
                        sx={{ p: 2, mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                        <ErrorOutlineRounded sx={{ color: "#C0553F" }} />
                        <Typography sx={{ fontSize: 13.5, color: INK }}>{error}</Typography>
                    </Card>
                )}

                {loading ? (
                    <Stack spacing={2.5}>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} variant="rounded" width={170} height={78} sx={{ borderRadius: 3 }} />
                            ))}
                        </Stack>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} variant="rounded" width={190} height={62} sx={{ borderRadius: 3 }} />
                            ))}
                        </Stack>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} variant="rounded" width={280} height={150} sx={{ borderRadius: 3 }} />
                            ))}
                        </Stack>
                        <Skeleton variant="rounded" height={180} sx={{ borderRadius: 3 }} />
                    </Stack>
                ) : (
                    <Stack spacing={3.5}>
                        {/* Quick stats */}
                        <Stack direction="row" flexWrap="wrap" gap={2}>
                            <StatPill value={String(stats.total)} label={copy.statLabels.total} tint={BRAND} />
                            <StatPill value={String(stats.open)} label={copy.statLabels.open} tint="#E3A857" />
                            <StatPill value={`${stats.rate}%`} label={copy.statLabels.rate} tint={BRAND_DARK} />
                        </Stack>

                        {/* Quick actions */}
                        <Stack direction="row" flexWrap="wrap" gap={2}>
                            {copy.quickActions.map((a) => (
                                <QuickActionCard key={a.href} icon={a.icon} label={a.label} href={a.href} onClick={(href) => router.push(href)} />
                            ))}
                        </Stack>

                        {/* Trending tags */}
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                                <Typography sx={{ fontWeight: 600, fontSize: 16, color: INK }}>
                                    หัวข้อที่พบบ่อย
                                </Typography>
                                <Button
                                    onClick={() => router.push(copy.browseHref)}
                                    endIcon={<ArrowForwardRounded sx={{ fontSize: 16 }} />}
                                    sx={{ fontSize: 13, textTransform: "none", color: BRAND, fontWeight: 600 }}
                                >
                                    {copy.browseLabel}
                                </Button>
                            </Stack>

                            {trending.length === 0 ? (
                                <Card sx={{ p: 4, textAlign: "center" }}>
                                    <Typography sx={{ fontSize: 13.5, color: SUB }}>
                                        ยังไม่มีปัญหาที่ติดแท็กในระบบ
                                    </Typography>
                                </Card>
                            ) : (
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                    {trending.map((t) => (
                                        <Card
                                            key={t.name}
                                            sx={{
                                                p: 2.25,
                                                flex: 1,
                                                minWidth: 0,
                                                transition: "box-shadow 0.2s ease, transform 0.2s ease",
                                                "&:hover": { boxShadow: "0 8px 24px rgba(31,79,73,0.10)", transform: "translateY(-2px)" },
                                            }}
                                        >
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                                                <Chip
                                                    icon={<LocalOfferOutlined sx={{ fontSize: 15, color: `${t.color} !important` }} />}
                                                    label={t.name}
                                                    sx={{
                                                        fontWeight: 600,
                                                        fontSize: 12.5,
                                                        backgroundColor: `${t.color}1A`,
                                                        color: t.color,
                                                    }}
                                                />
                                                <Typography sx={{ fontSize: 12, color: SUB }}>
                                                    {t.count} รายการ
                                                </Typography>
                                            </Stack>
                                            <Typography
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: 14.5,
                                                    color: INK,
                                                    mb: 0.5,
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 1,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {t.sample.pro_title}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: 12.5,
                                                    color: SUB,
                                                    mb: 1.5,
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {t.sample.pro_desc}
                                            </Typography>
                                            <Chip
                                                size="small"
                                                label={STATUS_META[t.sample.status]?.label ?? t.sample.status}
                                                sx={{
                                                    fontSize: 11.5,
                                                    fontWeight: 600,
                                                    backgroundColor: `${STATUS_META[t.sample.status]?.color ?? SUB}1A`,
                                                    color: STATUS_META[t.sample.status]?.color ?? SUB,
                                                }}
                                            />
                                        </Card>
                                    ))}
                                </Stack>
                            )}
                        </Box>

                        {/* Recent activity */}
                        <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: 16, color: INK, mb: 1.5 }}>
                                กิจกรรมล่าสุด
                            </Typography>

                            {recentActivity.length === 0 ? (
                                <Card sx={{ p: 4, textAlign: "center" }}>
                                    <Typography sx={{ fontSize: 13.5, color: SUB }}>
                                        ยังไม่มีปัญหาในระบบ
                                    </Typography>
                                </Card>
                            ) : (
                                <Card sx={{ overflow: "hidden" }}>
                                    {recentActivity.map((p, i) => (
                                        <Stack
                                            key={p.id}
                                            direction="row"
                                            alignItems="center"
                                            spacing={1.5}
                                            sx={{
                                                px: 2.25,
                                                py: 1.5,
                                                borderTop: i === 0 ? "none" : `1px solid ${HAIRLINE}`,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: "50%",
                                                    backgroundColor: STATUS_META[p.status]?.color ?? SUB,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <Typography
                                                sx={{
                                                    fontSize: 13.5,
                                                    color: INK,
                                                    flex: 1,
                                                    minWidth: 0,
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {p.pro_title}
                                            </Typography>
                                            <Chip
                                                size="small"
                                                label={STATUS_META[p.status]?.label ?? p.status}
                                                sx={{
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    backgroundColor: `${STATUS_META[p.status]?.color ?? SUB}1A`,
                                                    color: STATUS_META[p.status]?.color ?? SUB,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0, minWidth: 96, justifyContent: "flex-end" }}>
                                                <ScheduleOutlined sx={{ fontSize: 14, color: SUB }} />
                                                <Typography sx={{ fontSize: 12, color: SUB, whiteSpace: "nowrap" }}>
                                                    {timeAgo(p.create_at)}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    ))}
                                </Card>
                            )}
                        </Box>
                    </Stack>
                )}
            </Box>
        </Box>
    );
}