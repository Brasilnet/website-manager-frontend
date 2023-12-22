import React, { useContext, useState } from "react";
import { Button, Dropdown } from "react-bootstrap";
import { AuthContext } from "src/contexts/AuthContext";
import { closeModal, showModal } from "src/events";
import { INavBarDropdownMenuProps } from "src/interfaces/INavBar";

export default function NavBarDropdownMenu({ user }: INavBarDropdownMenuProps) {
  // const [showDropdown, setShowDropdown] = useState(false);

  const { signOut } = useContext(AuthContext);

  // const toggleDropdown = () => setShowDropdown(!showDropdown);

  const onSignOut = () =>
    showModal({
      title: "Sair",
      body: "Tem certeza de que deseja sair da plataforma?",
      buttons: (
        <>
          <Button variant="secondary" onClick={signOut}>
            Sair
          </Button>
          <Button variant="primary" onClick={closeModal}>
            Cancelar
          </Button>
        </>
      ),
    });

  return (
    // <div >
    //   <button className="btn btn-secondary" onClick={toggleDropdown}>
    //     <img alt="user image" src="/assets/img/avatar.png" />
    //     <span>{user?.name?.split(" ")[0]}</span>
    //   </button>

    //   <ul className={`navbar-menu ${showDropdown ? 'open' : ''}`}>
    //     <li>
    //       <a href={'/profile'} className="navbar-menu-item">Meu perfil</a>
    //     </li>
    //     <li onClick={onSignOut}>
    //       <a className="navbar-menu-item">Sair</a>
    //     </li>
    //   </ul>
    // </div>
    <Dropdown className="navbar-dropdown-menu">
      <Dropdown.Toggle variant="outline-dark" id="dropdown-basic">
        <img alt="user image" src="/assets/img/avatar.png" />
        <span>{user?.name?.split(" ")[0]}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item href="/profile">Meu Perfil</Dropdown.Item>
        <Dropdown.Item onClick={onSignOut}>Sair</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
