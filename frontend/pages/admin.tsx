import NavbarLayout from "../components/NavbarLayout";
import HomeOverview from "../components/HomeOverview";

export default function AdminHome() {
  return <HomeOverview role="admin" navbar={<NavbarLayout />} />;
}