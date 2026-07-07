import NavbarStu from "../components/NavbarStu";
import HomeOverview from "../components/HomeOverview";

export default function StuHome() {
  return <HomeOverview role="student" navbar={<NavbarStu />} />;
}
