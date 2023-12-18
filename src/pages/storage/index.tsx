import React, { useContext, useEffect, useState } from "react";
import { FileCard, MasterLayout } from "@components";
import { Button, Card, Col, Container, Form, InputGroup, Modal } from "react-bootstrap";
import { AuthContext } from "src/contexts/AuthContext";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { FaSearch } from "react-icons/fa";
import ApiFetch from "src/api";
import { IUser } from "src/interfaces/IUser";
import { IFile, IFileResponse } from "src/interfaces/IFileCard";
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import { toast } from "react-toastify";
import handleAxiosError from "src/utils/handleAxiosError";
import { TablePagination } from "@mui/material";
import DropTarget from "@uppy/drop-target";
import { IPaginationColumnFilters } from "src/interfaces/IPagination";

export default function Storage(): JSX.Element {
  const [showAddFilesModal, setShowAddFilesModal] = useState(false);
  const [files, setFiles] = useState<Array<IFile>>([]);
  const [updateList, setUpdateList] = useState<number>(0);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [itensPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<
    Array<IPaginationColumnFilters>
  >([]);

  const { user } = useContext(AuthContext);

  const uppy = new Uppy();

  useEffect(() => {
    if (window) {
      uppy.use(DropTarget, {
        target: ".page-content",
        onDrop: () => uppy.emit("upload"),
      });
    }

    return () => {
      uppy.close();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const response = await ApiFetch.post("/filesLibrary/pagination", {
        page: page,
        itemsPerPage: itensPerPage,
        searchFilter: searchFilter,
        columnFilters: columnFilters,
        columnSorting: [],
      });

      const filesReponse: IFileResponse = response.data;

      setFiles(filesReponse.data);
      setTotalItems(filesReponse.total);
    })();
  }, [updateList, page, itensPerPage, searchFilter, columnFilters]);

  uppy.on("upload", () => {
    uppy.getFiles().forEach(async (file) => {
      const formData = new FormData();
      formData.append("files", file.data, file.name);

      try {
        await ApiFetch.post("/filesLibrary/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        uppy.setFileState(file.id, { progress: { uploadComplete: true } });
        uppy.removeFile(file.id);
        setUpdateList((prev) => prev + 1);
        toast(`Arquivo ${file.name} adicionado com sucesso!`, {
          type: "success",
        });
      } catch (error: unknown) {
        uppy.setFileState(file.id, { error: "Erro no upload" });
        handleAxiosError(error);
      }
    });

    setShowAddFilesModal(false);
    uppy.close();
  });

  const handleAddFilesModal = () => setShowAddFilesModal(!showAddFilesModal);

  const filterFileExtensions = (extension: string) => {
    const mimeTypes: { [key: string]: string } = {
      images: "image",
      pdf: "application/pdf",
      video: "video",
    };

    if (extension == "all") {
      return setColumnFilters([]);
    }

    const filter: IPaginationColumnFilters = {
      id: "mimeType",
      value: mimeTypes[extension],
    };

    setColumnFilters([filter]);
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
        <Dashboard
          uppy={uppy}
          proudlyDisplayPoweredByUppy={false}
          showProgressDetails={true}
          width={'100%'}
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
              <Form.Control
                placeholder="Pesquise pelo nome do arquivo.."
                onChange={(event) =>
                  setSearchFilter(event?.currentTarget?.value)
                }
                value={searchFilter}
              />
              <Button variant="outline-primary" style={{ minWidth: 55 }}>
                <FaSearch size={20} />
              </Button>
            </InputGroup>
          </Col>
          <Button onClick={handleAddFilesModal}>Adicionar</Button>
        </Card.Header>
        <Card.Body>
          <div className="files-extension">
            <Button
              variant="outline-dark"
              onClick={() => filterFileExtensions("all")}
            >
              Tudo
            </Button>
            <Button
              variant="outline-dark"
              onClick={() => filterFileExtensions("images")}
            >
              Imagens
            </Button>
            <Button
              variant="outline-dark"
              onClick={() => filterFileExtensions("pdf")}
            >
              PDF
            </Button>
            <Button
              variant="outline-dark"
              onClick={() => filterFileExtensions("video")}
            >
              Vídeos
            </Button>
          </div>
          {files?.length > 0 ? (
            <div className="file-list">
              {files.map((file) => (
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
          ) : (
            <Container className="p-5 d-flex flex-column justify-content-center align-items-center">
              <span>Não encontramos nenhum arquivo,</span>
              <span>faça upload ou remova os filtros.</span>
            </Container>
          )}
        </Card.Body>
        <Card.Footer>
          <TablePagination
            sx={{
              ".MuiTablePagination-displayedRows": {
                display: "flex",
                alignItems: "center;",
                margin: 0,
              },
              ".MuiTablePagination-selectLabel": {
                display: "flex",
                alignItems: "center;",
                margin: 0,
              },
            }}
            labelRowsPerPage={'Itens por página'}
            component="div"
            rowsPerPageOptions={[10, 50, 100]}
            rowsPerPage={itensPerPage}
            count={totalItems}
            page={page}
            onPageChange={(_event, page) => {
              if (page !== 0) {
                setPage(page);
              }
            }}
            slotProps={{
              actions: {
                previousButton: {
                  disabled: page === 1
                }
              }
            }}
            onRowsPerPageChange={(event) =>
              setItemsPerPage(Number(event?.target?.value))
            }
          />
        </Card.Footer>
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
