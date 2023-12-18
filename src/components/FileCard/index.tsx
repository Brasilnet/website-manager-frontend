import { AxiosError } from "axios";
import React from "react";
import { Button, Dropdown } from "react-bootstrap";
import { FaEllipsisVertical } from "react-icons/fa6";
import { toast } from "react-toastify";
import ApiFetch from "src/api";
import { closeModal, showModal } from "src/events";
import { IFile } from "src/interfaces/IFileCard";
import { copyToClipboard, formatBytes } from "src/utils/functions";
import handleAxiosError from "src/utils/handleAxiosError";

export default function FileCard(props: IFile) {

  const mimeTypeIcon = {
    "application/pdf": "far fa-file-pdf",
    "video": "",
  };

  const deleteFile = async (file: IFile) => {
   try {
    const response = await ApiFetch.delete(`/filesLibrary/delete/${file.id}`);

    toast(response.data.message, { type: 'success' });
    props.updateCallback((prev) => prev + 1);
    closeModal();
   } catch (error: unknown) {
    handleAxiosError(error);
   }
  }

  const showModalDeleteFile = (file: IFile) => {
    showModal({
      title: `Remover arquivo [${file.name}]`,
      body: 'Deseja realmente remover esse arquivo?',
      buttons: (
        <>
          <Button variant="primary" onClick={() => deleteFile(file)}>Excluir</Button>
          <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
        </>
      ) 
    })
  }

  return (
    <div className="file-card">
      <img
        src={
          props.mimeType.includes("image") ? props.url : "/assets/img/file.png"
        }
        alt={props.name}
      />
      <div className="info-box">
        <div className="title">
          <h4 title={props.name}>{props.name}</h4>
          <Dropdown>
            <Dropdown.Toggle
              variant="outline"
              id="dropdown-basic"
              className="no-arrow no-btn"
            >
              <FaEllipsisVertical />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item href="#" onClick={() => copyToClipboard(props.url)}>Copiar URL</Dropdown.Item>
              <Dropdown.Item href="#" onClick={() => showModalDeleteFile(props)}>Excluir</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <span>{formatBytes(props.size)}</span>
      </div>
    </div>
  );
}
