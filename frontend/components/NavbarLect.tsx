import { AddAlert, Create, Description, Home, Logout, Menu, School } from "@mui/icons-material";
import {
    Toolbar,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Drawer,
    AppBar,
    IconButton,
    Typography,
    CssBaseline,
    Avatar,
    Tooltip,
} from "@mui/material";
import { useRouter } from "next/router";
import Head from "next/head";
import React from "react";
import NotificationBell from "./NotificationBell";

const drawerWidth = 260;

// ---- Design tokens (matches NavbarStu / NavbarLayout) ----
const colors = {
    tealDeep: "#0F2E2A",
    tealBase: "#1F4F49",
    gold: "#C9A227",
    goldLight: "#E8CD82",
    ivory: "#FCFBF7",
    ink: "#16221F",
    inkMuted: "#5C6B67",
};

const drawerGradient =
    "radial-gradient(120% 55% at 12% 0%, rgba(232,205,130,0.10), transparent 55%), linear-gradient(165deg, " +
    colors.tealBase +
    " 0%, " +
    colors.tealDeep +
    " 100%)";

const hairline = "linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0))";

interface Props {
    window?: () => Window;
}

const navItems = [
    { href: "/lect_home", label: "หน้าหลัก", icon: <Home /> },
    { href: "/lect_read", label: "ดูรายงานนักศึกษา", icon: <AddAlert /> },
    { href: "/lect_graph", label: "สรุปรายงานทั้งหมดของนักศึกษา", icon: <Description /> },
    { href: "/lect_edit", label: "แก้ไขข้อมูลส่วนตัว", icon: <Create /> },
];

export default function ResponsiveDrawer(props: Props) {
    const { window } = props;
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const router = useRouter();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const onLogout = () => {
        localStorage.removeItem("Logged");
        localStorage.removeItem("token");
        localStorage.removeItem("rid");
        router.push("/");
    };

    const drawer = (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Toolbar sx={{ py: 3.5, px: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 38,
                            height: 38,
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            background: `linear-gradient(135deg, ${colors.goldLight}, ${colors.gold})`,
                            boxShadow: "0 4px 14px rgba(201,162,39,0.35)",
                        }}
                    >
                        <School sx={{ color: colors.tealDeep, fontSize: 20 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            sx={{
                                fontFamily: "'Kanit', sans-serif",
                                fontWeight: 600,
                                fontSize: 16,
                                color: "#FFFFFF",
                                lineHeight: 1.25,
                                letterSpacing: 0.2,
                            }}
                        >
                            Report Hub
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: "'Sarabun', sans-serif",
                                fontSize: 11.5,
                                color: "rgba(255,255,255,0.55)",
                                letterSpacing: 0.2,
                            }}
                        >
                            ระบบแจ้งปัญหาการเรียน
                        </Typography>
                    </Box>
                </Box>
            </Toolbar>

            <Box sx={{ mx: 3, height: "1px", background: hairline }} />

            <Box sx={{ px: 2, py: 2.5, flex: 1 }}>
                {navItems.map((item) => {
                    const active = router.pathname === item.href;
                    return (
                        <ListItem key={item.href} disablePadding sx={{ mb: 0.75 }}>
                            <ListItemButton
                                component="a"
                                href={item.href}
                                sx={{
                                    position: "relative",
                                    borderRadius: 2,
                                    pl: 2.25,
                                    py: 1.1,
                                    color: "#FFFFFF",
                                    backgroundColor: active ? "rgba(255,255,255,0.08)" : "transparent",
                                    transition: "background-color 0.2s ease",
                                    "&:hover": { backgroundColor: "rgba(255,255,255,0.10)" },
                                    "&::before": {
                                        content: '""',
                                        position: "absolute",
                                        left: 0,
                                        top: "18%",
                                        bottom: "18%",
                                        width: 3,
                                        borderRadius: 4,
                                        background: `linear-gradient(180deg, ${colors.goldLight}, ${colors.gold})`,
                                        opacity: active ? 1 : 0,
                                        transition: "opacity 0.2s ease",
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: active ? colors.goldLight : "rgba(255,255,255,0.85)",
                                        minWidth: 38,
                                        transition: "color 0.2s ease",
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontFamily: "'Sarabun', sans-serif",
                                        fontSize: 14.5,
                                        fontWeight: active ? 600 : 400,
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </Box>

            <Box sx={{ mx: 3, height: "1px", background: hairline }} />

            <ListItem disablePadding sx={{ p: 2 }}>
                <ListItemButton
                    onClick={onLogout}
                    sx={{
                        borderRadius: 2,
                        color: "rgba(255,255,255,0.85)",
                        py: 1.1,
                        transition: "background-color 0.2s ease, color 0.2s ease",
                        "&:hover": { backgroundColor: "rgba(214,90,90,0.14)", color: "#FFC1C1" },
                    }}
                >
                    <ListItemIcon sx={{ color: "inherit", minWidth: 38 }}>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary="ออกจากระบบ"
                        primaryTypographyProps={{ fontFamily: "'Sarabun', sans-serif", fontSize: 14 }}
                    />
                </ListItemButton>
            </ListItem>
        </Box>
    );

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&family=Sarabun:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <AppBar
                    position="fixed"
                    elevation={0}
                    sx={{
                        width: { sm: `calc(100% - ${drawerWidth}px)` },
                        ml: { sm: `${drawerWidth}px` },
                        backgroundColor: "rgba(252,251,247,0.85)",
                        backdropFilter: "blur(10px)",
                        color: colors.ink,
                        boxShadow: "0 1px 0 rgba(31,79,73,0.08), 0 8px 24px rgba(15,46,42,0.06)",
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: "none" } }}
                        >
                            <Menu />
                        </IconButton>
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{ fontFamily: "'Kanit', sans-serif", fontWeight: 600, fontSize: 18 }}
                        >
                            หน้าหลัก
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <NotificationBell role="lecturer" />
                        <Box sx={{ display: "flex", alignItems: "center", ml: 1.5, gap: 1.25 }}>
                            <Avatar
                                sx={{
                                    width: 34,
                                    height: 34,
                                    fontSize: 14,
                                    fontFamily: "'Kanit', sans-serif",
                                    fontWeight: 600,
                                    bgcolor: colors.tealBase,
                                    border: `2px solid ${colors.gold}`,
                                    boxShadow: "0 2px 8px rgba(201,162,39,0.25)",
                                }}
                            >
                                L
                            </Avatar>
                            <Typography
                                variant="body2"
                                noWrap
                                sx={{
                                    display: { xs: "none", sm: "block" },
                                    fontFamily: "'Sarabun', sans-serif",
                                    fontWeight: 500,
                                    color: colors.inkMuted,
                                }}
                            >
                                อาจารย์
                            </Typography>
                        </Box>
                        <Tooltip title="ออกจากระบบ">
                            <IconButton onClick={onLogout} sx={{ color: colors.inkMuted, ml: 0.5 }}>
                                <Logout fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Toolbar>
                </AppBar>
                <Box
                    component="nav"
                    sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                    aria-label="mailbox folders"
                >
                    <Drawer
                        container={container}
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            display: { xs: "block", sm: "none" },
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                width: drawerWidth,
                                background: drawerGradient,
                                border: "none",
                                boxShadow: "4px 0 24px rgba(15,46,42,0.18)",
                            },
                        }}
                    >
                        {drawer}
                    </Drawer>
                    <Drawer
                        variant="permanent"
                        sx={{
                            display: { xs: "none", sm: "block" },
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                width: drawerWidth,
                                background: drawerGradient,
                                border: "none",
                                boxShadow: "4px 0 24px rgba(15,46,42,0.18)",
                            },
                        }}
                        open
                    >
                        {drawer}
                    </Drawer>
                </Box>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        width: { sm: `calc(100% - ${drawerWidth}px)` },
                    }}
                >
                    <Toolbar />
                </Box>
            </Box>
        </>
    );
}