import useAuth from "../../lib/useAuth";
import Navbar from "./Navbar";
import LoggedInNavbar from "./LoggedInNavbar";

export default function AppNavbar() {
  const { user, loading } = useAuth();

  // While checking auth, show public navbar to prevent flicker
  if (loading) return <Navbar />;

  return user ? <LoggedInNavbar /> : <Navbar />;
}
