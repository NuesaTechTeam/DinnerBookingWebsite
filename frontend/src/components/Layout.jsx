import Navbar from "./Navbar.jsx";
import {Footer} from "../components/Hero";

const Layout = ({ children }) => {
  return (
    <div>
      <main>{children}</main>
      <Footer />
    </div>
  );
};
export default Layout;
