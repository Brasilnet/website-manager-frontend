import React, { useContext, useState } from "react";
import SideBar from "@components/SideBar";
import { useRouter } from "next/router";
import { Breadcrumb, Button } from "react-bootstrap";
import sidebar from "src/config/sidebar";
import NavBar from "@components/NavBar";
import { FaAlignRight, FaBars } from "react-icons/fa";
import NavBarDropdownMenu from "@components/NavBar/NavBarDropdownMenu";
import { AuthContext } from "src/contexts/AuthContext";

interface Children {
  children?: JSX.Element | JSX.Element[] | null;
}

export default function MasterLayout({ children }: Children) {
  const [sideBarIsOpen, setSideBarIsOpen] = useState(false);

  const router = useRouter();
  const { user } = useContext(AuthContext);

  const showNavbarOnRoutes = ["/dashboard"];

  const toggleSideBar = () => setSideBarIsOpen(!sideBarIsOpen);

  return (
    <main className="overflow-hidden d-flex flex-row">
      <SideBar
        defaultConfig={sidebar.defaultConfig}
        items={sidebar.menuItems}
        isOpen={sideBarIsOpen}
        toggleSideBar={toggleSideBar}
      />
      <div className="main-container">
        <NavBar>
          <Button
            className="btn-sidebar btn-primary-ms"
            onClick={toggleSideBar}
          >
            {sideBarIsOpen ? <FaAlignRight size={20} /> : <FaBars size={20} />}
          </Button>
          <div className="d-flex flex-end flex-row">
            <NavBarDropdownMenu user={user} />
          </div>
        </NavBar>
        <div className="page-content">
          {children}
        </div>
      </div>
    </main>
  );
}
