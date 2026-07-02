import { Card, CardContent, Typography } from "@mui/material";
import { Box } from "@mui/system";
import ProblemCountComponent from "../components/ProblemCountComponent";
import PercentageChart from "../components/PercentageChart";
import ComponentGraph from "../components/ComponentGraph";
import ProblemTypeChart from "../components/ProblemTypeChart";
import CountTag from "../components/CountTag";
import ComponentMount from "../components/ComponentMount";
import NavbarLect from "../components/NavbarLect";
import styles from "../styles/Home.module.css";

const Graph: React.FC = () => {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <NavbarLect />
      <Box
        component="main"
        sx={{
          ml: { sm: "260px" },
          mt: "64px",
          p: { xs: 2, sm: 4 },
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          สรุปรายงานทั้งหมดของนักศึกษา
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          ภาพรวมแนวโน้มและสถิติการแจ้งปัญหา
        </Typography>

        <ProblemCountComponent />

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mt: 2,
          }}
        >
          <div className={styles.StyledGraphCard}>
            <ComponentGraph />
          </div>
          <div className={styles.StyledCard}>
            <ProblemTypeChart />
          </div>
        </Box>

        <Box sx={{ mt: 2 }}>
          <CountTag />
        </Box>
      </Box>
    </Box>
  );
};

export default Graph;
