import React from "react";
import { FaFolderOpen, FaHouse, FaReact } from "react-icons/fa6";
import app from "../config/app";
import { IUser } from "src/interfaces/IUser";
import { ISideBarConfig, ISideBarItems } from "src/interfaces/ISideBar";

export default function useSidebarConfig(user: IUser | null) {
  const allRoutes:  { [key: string]: ISideBarItems } = {
    '/storage': {
      icon: <FaFolderOpen size={20} />,
      title: "Arquivos",
      href: '/storage',
    },
    '/website': {
      icon: <FaReact size={20} />,
      title: "Website",
      subItems: [
        {
          title: 'Home',
          href: '/website/home',
        },
      ]
    },
  };

  const config: ISideBarConfig = {
    defaultConfig: {
      logo: app.logo.light,
      icon: app.icon.light,
    },
    menuItems: [
      {
        icon: <FaHouse size={20} />,
        title: "Início",
        href: "/",
      },
    ],
  };

  if (user) {
    user.permissions.map((route) => config.menuItems.push(allRoutes[route]));
  }

  return config;
};
