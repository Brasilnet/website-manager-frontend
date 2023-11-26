import React, { useContext, useEffect, useState } from "react";
import { FileCard, MasterLayout } from "@components";
import {
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Modal,
  Row,
} from "react-bootstrap";
import { AuthContext } from "src/contexts/AuthContext";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { FaSearch } from "react-icons/fa";
import ApiFetch from "src/api";
import { IUser } from "src/interfaces/IUser";
import { IFile } from "src/interfaces/IFileCard";
import { FileUpload } from 'primereact/fileupload';

export default function Storage(): JSX.Element {
  const [showAddFilesModal, setShowAddFilesModal] = useState(false);
  const [files, setFiles] = useState<Array<IFile>>([]);
  const [updateList, setUpdateList] = useState<number>(0);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      const response = await ApiFetch.post("/filesLibrary/pagination", {
        page: 1,
        itemsPerPage: 10,
        searchFilter: "",
        columnFilters: [],
        columnSorting: [],
      });

      const files: Array<IFile> = response.data.data;

      setFiles(files);
    })();
  }, [updateList]);

  const handleAddFilesModal = () => setShowAddFilesModal(!showAddFilesModal);

  const uploadFiles = (files) => {
    console.log(files);
  };

  const ModalAddFiles = () => (
    <Modal 
      show={showAddFilesModal}
      onHide={handleAddFilesModal}
      centered
      size="lg"  
    >
      <Modal.Header closeButton>
        <Modal.Title>Adicionar arquivos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FileUpload
          name="demo[]"
          url="/api/filesLibrary/upload"
          multiple
          accept="image/*"
          maxFileSize={1000000}
          cancelOptions={{
            className: 'p-cancel',
            label: 'Limpar lista',
          }}
          uploadOptions={{
            className: 'p-upload',
            label: 'Upload',
          }}
          chooseLabel="Selecionar"
        />
      </Modal.Body>
    </Modal>
  );

  return (
    <MasterLayout>
      <Card>
        <Card.Header className="d-flex align-items-center justify-content-between">
          <Col md="3">
            <InputGroup>
              <Form.Control placeholder="Pesquise pelo nome do arquivo.." />
              <Button variant="outline-primary" style={{ minWidth: 55 }}>
                <FaSearch size={20} />
              </Button>
            </InputGroup>
          </Col>
          <Button onClick={handleAddFilesModal}>Adicionar</Button>
        </Card.Header>
        <Card.Body>
          <div className="file-list">
            {files &&
              files.map((file) => (
                <FileCard
                  key={`${file.id}-${file.name}`}
                  id={file.id}
                  name={file.name}
                  size={file.size}
                  mimeType={file.mimeType}
                  url={file.url}
                  updateCallback={setUpdateList}
                />
              ))}
          </div>
        </Card.Body>
      </Card>
      <ModalAddFiles />
    </MasterLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { resolvedUrl } = ctx;
  const { ["brasilnet-manager.token"]: token } = parseCookies(ctx);

  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const response = await ApiFetch.get("/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status == 200) {
    const user: IUser = response.data;

    if (user && !user.permissions.includes(resolvedUrl)) {
      return {
        redirect: {
          destination: "/401",
          permanent: false,
        },
      };
    }
  }

  return {
    props: {},
  };
};
