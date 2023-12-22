import React, { useContext, useState, useEffect } from "react";
import SideBar from "@components/SideBar";
import { useRouter } from "next/router";
import { Button, Modal } from "react-bootstrap";
import NavBar from "@components/NavBar";
import { FaAlignRight, FaBars } from "react-icons/fa";
import NavBarDropdownMenu from "@components/NavBar/NavBarDropdownMenu";
import { AuthContext } from "src/contexts/AuthContext";
import emitter from "src/events/emitter";
import useSidebarConfig from "@hooks/getSidebarConfig";

interface Children {
  children?: JSX.Element | JSX.Element[] | null;
}

interface IModal {
  visible: boolean;
  title: string | null;
  body: string | JSX.Element | null;
  buttons: JSX.Element | JSX.Element[] | null;
}

export default function MasterLayout({ children }: Children) {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [sideBarIsOpen, setSideBarIsOpen] = useState<boolean>(false);
  const [modal, setModal] = useState<IModal>({
    visible: false,
    title: null,
    body: null,
    buttons: null,
  });

  const router = useRouter();
  const { user } = useContext(AuthContext);

  const { defaultConfig, menuItems } = useSidebarConfig(user);

  useEffect(() => {
    setIsClient(true);

    emitter.addListener('modal', setModal);
    emitter.addListener('close-modal', handleCloseModal);
  }, []);

  const toggleSideBar = () => setSideBarIsOpen(!sideBarIsOpen);

  const handleCloseModal = () => setModal({
    visible: false,
    title: null,
    body: null,
    buttons: null,
  });

  return (
    <main className="overflow-hidden d-flex flex-row">
      <SideBar
        defaultConfig={defaultConfig}
        items={menuItems}
        isOpen={sideBarIsOpen}
        toggleSideBar={toggleSideBar}
      />
      <div className="main-container">
        <NavBar>
          <Button
            variant="primary"
            className="btn-sidebar"
            onClick={toggleSideBar}
          >
            {sideBarIsOpen ? <FaAlignRight size={20} /> : <FaBars size={20} />}
          </Button>
          <div className="d-flex flex-end flex-row">
            <NavBarDropdownMenu user={user} />
          </div>
        </NavBar>
        <div className="page-content">{children}</div>
      </div>
      {isClient && (
        <Modal show={modal.visible} onHide={handleCloseModal} animation={false} centered>
          <Modal.Header closeButton>
            <Modal.Title>{modal.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {typeof (modal.body) === 'string' ? <span>{modal.body}</span> : modal.body}
          </Modal.Body>
          <Modal.Footer>
            {modal.buttons}
          </Modal.Footer>
        </Modal>
      )}
    </main>
  );
}
