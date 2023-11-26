import React from "react";
import { FaFolderOpen, FaHouse } from "react-icons/fa6";
import app from "./app";

export default {
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
    {
      icon: <FaFolderOpen size={20} />,
      title: "Arquivos",
      href: '/storage',
    },
  ],
};
