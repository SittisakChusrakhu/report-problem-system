import NavbarLect from "../components/NavbarLect";
import HomeOverview from "../components/HomeOverview";

export default function LectHome() {
  return <HomeOverview role="lecturer" navbar={<NavbarLect />} />;
}
