import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";
import {
  ISideBarItems,
  ISideBarProps,
  ISideBarSubItems,
} from "src/interfaces/ISideBar";

/**
 * Renders a single sub-item for a sidebar.
 *
 * @param {ISideBarSubItems} props - Contains title and href for the sub-item.
 */
export function SideBarSubItem({ title, href }: ISideBarSubItems) {
  const { pathname } = useRouter();
  const isActive = pathname === href;

  return (
    <li className="sidebar-subitem">
      <a href={href} className={isActive ? "active" : ""}>
        {title}
      </a>
    </li>
  );
}

/**
 * Represents an individual item in the sidebar, which can be either a single link or a collapsible item with sub-items.
 *
 * @param {ISideBarItems & { isOpen: boolean; onToggle: () => void; isSidebarOpen: boolean }} props - The item properties, including the state and toggle function for collapsible items.
 */
export function SideBarItem({
  icon,
  title,
  href,
  subItems,
  isOpen,
  onToggle,
  isSidebarOpen,
}: ISideBarItems & {
  isOpen: boolean;
  onToggle: () => void;
  isSidebarOpen: boolean;
}) {
  const router = useRouter();
  const isActive = router.pathname === href;

  /**
   * Handles the click event on the sidebar item. Manages navigation and toggle behavior.
   *
   * @param {React.MouseEvent<HTMLAnchorElement, MouseEvent>} event - The click event.
   */
  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (!isSidebarOpen && subItems && subItems.length > 0) {
      event.preventDefault();
      router.push(subItems[0].href);
      return;
    }

    if (!href && subItems && subItems.length > 0) {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="sidebar-item">
      <a
        href={
          isSidebarOpen
            ? href || "#"
            : subItems && subItems.length > 0
            ? subItems[0].href
            : href || "#"
        }
        onClick={handleClick}
        className={`${
          !isSidebarOpen
            ? `icon-only ${
                subItems && subItems.length > 0
                  ? subItems[0].href === router.pathname
                    ? "active"
                    : ""
                  : null
              }`
            : ""
        } ${isActive ? "active" : ""}`}
      >
        {icon}
        {isSidebarOpen && <span>{title}</span>}
        <span className="toggle-icon">
          {subItems && subItems.length > 0 && isSidebarOpen && (isOpen ? <FaAngleUp /> : <FaAngleDown />)}
        </span>
      </a>
      {subItems && subItems.length > 0 && isOpen && isSidebarOpen && (
        <div className={`sidebar-subitems ${isOpen ? "open" : ""}`}>
          {subItems.map((subItem) => (
            <SideBarSubItem
              key={subItem.href}
              href={subItem.href}
              title={subItem.title}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The main sidebar component, which renders all sidebar items.
 *
 * @param {ISideBarProps} props - The properties including sidebar configuration and items.
 */
export default function SideBar({
  defaultConfig,
  items,
  isOpen,
  toggleSideBar,
}: ISideBarProps) {
  const [openItemId, setOpenItemId] = useState<number | null>(null);
  const { pathname } = useRouter();

  /**
   * Finds the index of the active item based on the current path.
   *
   * @returns {number} The index of the active item.
   */
  const findActiveItemIndex = () => {
    return items.findIndex((item) =>
      item.subItems?.some((subItem) => pathname === subItem.href)
    );
  };

  /**
   * Toggles the open state of a sidebar item.
   *
   * @param {number} index - The index of the item to toggle.
   */
  const handleToggle = (index: number) => {
    setOpenItemId((prevOpenItemId) =>
      prevOpenItemId === index ? null : index
    );
  };

  // Automatically open the sidebar item that contains the active sub-item.
  useEffect(() => {
    const activeIndex = findActiveItemIndex();
    if (activeIndex >= 0) {
      handleToggle(activeIndex);
    }
    // Adding dependencies to the effect ensures that it correctly responds to changes.
  }, [pathname, items, isOpen]);

  return (
    <div className="sidebar-wapprer">
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="header">
          <img
            alt="Logo"
            src={isOpen ? defaultConfig.logo : defaultConfig.icon}
          />
        </div>
        <div className="content">
          {items.map((item, index) => (
            <SideBarItem
              {...item}
              key={`${item.title}-${index}`}
              isOpen={index === openItemId}
              onToggle={() => handleToggle(index)}
              isSidebarOpen={isOpen}
            />
          ))}
        </div>
      </div>

      {/* Overlay for toggle SideBar on mobile */}
      <a
        href="#"
        className={`overlay ${isOpen ? "open" : ""}`}
        onClick={toggleSideBar}
      />
    </div>
  );
}
