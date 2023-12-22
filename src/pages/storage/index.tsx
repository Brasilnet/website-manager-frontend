import React, { useContext, useEffect, useState } from "react";
import { FileCard, MasterLayout } from "@components";
import {
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  Form,
  InputGroup,
  Modal,
  Row,
} from "react-bootstrap";
import { AuthContext } from "src/contexts/AuthContext";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { FaSearch, FaCalendarAlt } from "react-icons/fa";
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
import { FieldValues, useForm } from "react-hook-form";

export default function Storage(): JSX.Element {
  const [showAddFilesModal, setShowAddFilesModal] = useState(false);
  const [files, setFiles] = useState<Array<IFile>>([]);
  const [updateList, setUpdateList] = useState<number>(0);
  
  const [extension, setExtension] = useState<string|null>('all');
  const [dateRange, setDateRange] = useState<string|null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [itensPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<
    Array<IPaginationColumnFilters>
  >([]);

  const { user } = useContext(AuthContext);

  const { handleSubmit, register, formState: { errors } } = useForm({
    criteriaMode: 'all',
  });

  const uppy = new Uppy({
    restrictions: {
      maxFileSize: 10000000,
      maxNumberOfFiles: 20,
      minNumberOfFiles: 1,
      allowedFileTypes: ["image/*", "application/pdf", "video/*"],
    },
  });

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
        columnSorting: [
          {
            id: "createdAt",
            desc: true,
          },
        ],
      });

      const filesReponse: IFileResponse = response.data;

      setFiles(filesReponse.data);
      setTotalItems(filesReponse.total);
    })();
  }, [updateList, page, itensPerPage, searchFilter, columnFilters]);

  uppy.on("upload", async () => {
    const files = uppy.getFiles();
    const filePromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("files", file.data, file.name);

      try {
        await ApiFetch.post("/filesLibrary/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        return file;
      } catch (error) {
        console.log(error);
        handleAxiosError(error);
        return null;
      }
    });

    const uploadedFiles = await Promise.all(filePromises);

    uploadedFiles.forEach((file) => {
      if (file) {
        uppy.setFileState(file.id, { progress: { uploadComplete: true } });
        uppy.removeFile(file.id);
        toast(`Arquivo ${file.name} adicionado com sucesso!`, {
          type: "success",
        });
      }
    });

    setShowAddFilesModal(false);
    uppy.close();
  });

  const handleAddFilesModal = () => setShowAddFilesModal(!showAddFilesModal);
  const handleShowFilters = () => setShowFilters(!showFilters);

  const filterFileExtensions = (extension: string) => {
    const mimeTypes: { [key: string]: string } = {
      images: "image",
      pdf: "application/pdf",
      video: "video",
    };

    setExtension(extension);

    if (extension == "all") {
      return setColumnFilters([]);
    }

    const filter: IPaginationColumnFilters = {
      id: "mimeType",
      value: mimeTypes[extension],
    };

    setColumnFilters([filter]);
  };
  
  const onSubmitDatePicker = (data: FieldValues) => {
    const values = [
      {
        '$d': data.startDate,
      },
      {
        '$d': data.endDate,
      }
    ];

    setColumnFilters([{
      id: 'createdAt',
      value: values,
    }]);

    setDateRange(`${data.startDate} - ${data.endDate}`);
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
          width={"100%"}
        />
      </Modal.Body>
    </Modal>
  );

  return (
    <MasterLayout>
      <Card className="file-library">
        <Card.Header className="d-flex align-items-center justify-content-between">
          <div className="header-options">
            <Col className="col-12 col-md-6 col-lg-3">
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
            <Col className="col-1 col-3 d-flex justify-content-md-end">
              <Button onClick={handleAddFilesModal}>Adicionar</Button>
            </Col>
          </div>
        </Card.Header>
        <Card.Body>
          <Button className="btn-show-filters mb-3" onClick={handleShowFilters}>Filtros</Button>

          <div className={`${!showFilters && 'd-none'} files-extension mb-3`}>
            <Button
              variant={extension === 'all' ? 'dark' : 'outline-dark'}
              onClick={() => filterFileExtensions("all")}
            >
              Tudo
            </Button>
            <Button
              variant={extension === 'images' ? 'dark' : 'outline-dark'}
              onClick={() => filterFileExtensions("images")}
            >
              Imagens
            </Button>
            <Button
              variant={extension === 'pdf' ? 'dark' : 'outline-dark'}
              onClick={() => filterFileExtensions("pdf")}
            >
              PDF
            </Button>
            <Button
              variant={extension === 'video' ? 'dark' : 'outline-dark'}
              onClick={() => filterFileExtensions("video")}
            >
              Vídeos
            </Button>

            <Dropdown>
              <Dropdown.Toggle variant="outline-primary no-arrow">
                <FaCalendarAlt size={15} /> {dateRange || 'Filtrar por Data'}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Form className="p-2" onSubmit={handleSubmit(onSubmitDatePicker)}>
                  <Form.Group>
                    <Form.Label>Data de início</Form.Label>
                    <Form.Control type="date" {...register('startDate')} />
                  </Form.Group>

                  <Form.Group className="mt-2">
                    <Form.Label>Data de fim</Form.Label>
                    <Form.Control type="date" {...register('endDate')} />
                  </Form.Group>

                  <Form.Group className="mt-2 d-flex flex-column gap-2">
                    <Button type="submit">Filtrar</Button>
                    <Button type="reset" variant="danger" onClick={() => {
                      setColumnFilters([]);
                      setDateRange(null);
                    }}>
                      Limpar Filtros
                    </Button>
                  </Form.Group>
                </Form>
              </Dropdown.Menu>
            </Dropdown>
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
          {totalItems > 0 && (
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
              labelRowsPerPage={"Itens por página"}
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
                    disabled: page === 1,
                  },
                },
              }}
              onRowsPerPageChange={(event) =>
                setItemsPerPage(Number(event?.target?.value))
              }
            />
          )}
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
