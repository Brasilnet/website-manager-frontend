import React from "react"
import emitter from "./emitter";

export interface IModal {
    title: string;
    body: string | React.JSX.Element | React.JSX.Element[]; 
    buttons?:  React.JSX.Element | React.JSX.Element[];
}

export const showModal = ({ title, body, buttons }: IModal): void => {
    emitter.emit('modal', {
        visible: true,
        title,
        body,
        buttons,
    });
}

export const closeModal = (): void => {
    emitter.emit('close-modal');
}