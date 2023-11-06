import React from "react";
import { FaCar, FaDashcube, FaHouse } from "react-icons/fa6";
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
      icon: <FaDashcube size={20} />,
      title: "Teste",
      subItems: [
        { title: "Subitem 1", href: "/dashboard" },
      ],
    },
  ],
};