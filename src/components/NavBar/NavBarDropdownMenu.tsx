import React, { useContext, useState } from "react";
import { AuthContext } from "src/contexts/AuthContext";
import { INavBarDropdownMenuProps } from "src/interfaces/INavBar";

export default function NavBarDropdownMenu({ user }: INavBarDropdownMenuProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const { signOut } = useContext(AuthContext);
  
  const toggleDropdown = () => setShowDropdown(!showDropdown);

  return (
    <div className="navbar-dropdown-menu">
      <button className="btn btn-secondary" onClick={toggleDropdown}>
        <img alt="user image" src="assets/img/avatar.png" />
        <span>{user?.name.split(" ")[0]}</span>
      </button>

      <ul className={`navbar-menu ${showDropdown ? 'open' : ''}`}>
        <li>
          <span className="navbar-menu-item">Meu perfil</span>
        </li>
        <li onClick={signOut}>
          <span className="navbar-menu-item">Sair</span>
        </li>
      </ul>
    </div>
  );
}
