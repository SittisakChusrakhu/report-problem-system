import "../styles/globals.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import type { AppProps } from "next/app";

const THEME = createTheme({
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: "'Kanit', sans-serif",
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 500, textTransform: "none" },
  },
  palette: {
    mode: "light",
    primary: {
      light: "#5CA89F",
      main: "#2F7268",
      dark: "#1F4F49",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ff8a65",
      main: "#E85D4F",
      dark: "#c0392b",
      contrastText: "#fff",
    },
    info: {
      light: "#E9F5F3",
      main: "#368980",
      dark: "#1F4F49",
      contrastText: "#fff",
    },
    success: {
      main: "#3FA66B",
    },
    warning: {
      main: "#E8A33D",
    },
    error: {
      main: "#E0524A",
    },
    background: {
      default: "#F4F7F6",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1E2A28",
      secondary: "#5F716E",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F4F7F6",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: "0 6px 24px rgba(31, 79, 73, 0.08)",
          border: "1px solid rgba(47, 114, 104, 0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 4px 16px rgba(31, 79, 73, 0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingTop: 8,
          paddingBottom: 8,
        },
        contained: {
          boxShadow: "0 4px 12px rgba(47, 114, 104, 0.25)",
          "&:hover": {
            boxShadow: "0 6px 16px rgba(47, 114, 104, 0.32)",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#fff",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: "#EFF5F3",
          color: "#1F4F49",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={THEME}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}