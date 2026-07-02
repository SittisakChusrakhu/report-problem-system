import { AddCircleOutline, BarChart, Description, Home, Logout, Menu, NotificationsActive } from "@mui/icons-material";
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
    Divider,
    Avatar,
    Tooltip,
} from "@mui/material";
import { useRouter } from "next/router";
import React from "react";

const drawerWidth = 260;

interface Props {
    window?: () => Window;
}

const navItems = [
    { href: "/admin", label: "หน้าหลัก", icon: <Home /> },
    { href: "/add-uesr", label: "จัดการผู้ใช้งาน", icon: <AddCircleOutline /> },
    { href: "/add-report", label: "เพิ่ม Topic เรื่องปัญหาการเรียน", icon: <Description /> },
    { href: "/menu_add", label: "รายงานภาพรวม", icon: <BarChart /> },
];

export default function ResponsiveDrawer(props: Props) {
    const { window } = props;
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const router = useRouter();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const onlogout = () => {
        localStorage.removeItem("Logged");
        router.push("/");
    };

    const drawer = (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Toolbar sx={{ color: "#FFFFFF", py: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                    Students report<br />problems
                </Typography>
            </Toolbar>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
            <Box sx={{ px: 1.5, py: 2, flex: 1 }}>
                {navItems.map((item) => {
                    const active = router.pathname === item.href;
                    return (
                        <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                component="a"
                                href={item.href}
                                sx={{
                                    borderRadius: 2.5,
                                    color: "#FFFFFF",
                                    backgroundColor: active ? "rgba(255,255,255,0.16)" : "transparent",
                                    "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
                                }}
                            >
                                <ListItemIcon sx={{ color: "#FFFFFF", minWidth: 40, opacity: active ? 1 : 0.85 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400 }} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </Box>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
            <ListItem disablePadding sx={{ p: 1.5 }}>
                <ListItemButton onClick={onlogout} sx={{ borderRadius: 2.5, color: "#FFFFFF" }}>
                    <ListItemIcon sx={{ color: "#FFFFFF", minWidth: 40 }}>
                        <Logout />
                    </ListItemIcon>
                    <ListItemText primary="ออกจากระบบ" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
            </ListItem>
        </Box>
    );

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    backgroundColor: "#FFFFFF",
                    color: "#1E2A28",
                    borderBottom: "1px solid rgba(47,114,104,0.1)",
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
                    <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
                        หน้าหลัก
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Tooltip title="การแจ้งเตือน">
                        <IconButton sx={{ color: "text.secondary" }}>
                            <NotificationsActive />
                        </IconButton>
                    </Tooltip>
                    <Box sx={{ display: "flex", alignItems: "center", ml: 1.5, gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 14 }}>A</Avatar>
                        <Typography variant="body2" noWrap sx={{ display: { xs: "none", sm: "block" } }}>
                            แอดมิน
                        </Typography>
                    </Box>
                    <Tooltip title="ออกจากระบบ">
                        <IconButton onClick={onlogout} sx={{ color: "text.secondary", ml: 0.5 }}>
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
                            background: "linear-gradient(180deg, #2F7268 0%, #1F4F49 100%)",
                            border: "none",
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
                            background: "linear-gradient(180deg, #2F7268 0%, #1F4F49 100%)",
                            border: "none",
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
    );
}
