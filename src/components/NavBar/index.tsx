import React from "react";

interface Children {
    children?: JSX.Element | JSX.Element[] | null;
}

export default function NavBar({ children }: Children) {
    return (
        <nav className="navbar">
            {children}
        </nav>
    );
}