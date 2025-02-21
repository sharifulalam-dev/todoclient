import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
export default function MainLayout() {
  return (
    <>
      <div className="w-11/12 mx-auto">
        <Navbar />
        <Outlet />
        <Footer />
      </div>
    </>
  );
}
