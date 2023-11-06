import React from "react";

export interface ISideBarSubItems {
    title: string;
    href: string;
}

export interface ISideBarItems {
    icon: React.JSX.Element;
    title: string;
    href?: string; 
    subItems?: Array<ISideBarSubItems>,
}

export interface ISideBarDefaultConfig {
    logo: string,
    icon: string,
}

export interface ISideBarProps {
    defaultConfig: ISideBarDefaultConfig,
    items: Array<ISideBarItems>;
    isOpen: boolean;
    toggleSideBar: () => void,
}
