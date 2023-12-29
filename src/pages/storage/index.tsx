import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import { FaCalendarAlt } from "react-icons/fa";
import { MdSearch, MdClose } from "react-icons/md";
import ApiFetch from "src/api";
import { IUser } from "src/interfaces/IUser";
import { IFile, IFileResponse } from "src/interfaces/IFileCard";
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import { toast } from "react-toastify";
import handleAxiosError from "src/utils/handleAxiosError";
import {
  IconButton,
  InputAdornment,
  TablePagination,
  TextField,
  Tooltip,
} from "@mui/material";
import DropTarget from "@uppy/drop-target";
import { IPaginationColumnFilters } from "src/interfaces/IPagination";
import { FieldValues, useForm } from "react-hook-form";
import Select2 from "@components/Select2";
import { OptionType } from "src/interfaces/ISelect2";
import { IFileCategory } from "src/interfaces/IFile";
import { FaEllipsisVertical, FaPlus } from "react-icons/fa6";
import { closeModal, showModal } from "src/events";

export default function Storage(): JSX.Element {
  const [showAddFilesModal, setShowAddFilesModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [files, setFiles] = useState<Array<IFile>>([]);
  const [updateList, setUpdateList] = useState<number>(0);

  const [categorySelected, setCategorySelect] = useState<any>(null);
  const [categorySelectedFilter, setCategorySelectFilter] = useState<any>({
    label: "Todas Categorias",
    value: "all",
  });
  const [categories, setCategories] = useState<Array<OptionType>>([]);
  const [extension, setExtension] = useState<string | null>("all");
  const [dateRange, setDateRange] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [itensPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<
    Array<IPaginationColumnFilters>
  >([]);

  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm({
    criteriaMode: "all",
  });

  const uppy = new Uppy({
    restrictions: {
      maxFileSize: 10000000,
      maxNumberOfFiles: 20,
      minNumberOfFiles: 1,
      allowedFileTypes: ["image/*", "application/pdf", "video/*"],
    },
  });

  // Get Categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiFetch.get("/filesLibrary/categories");

        if (response.status === 200) {
          setCategories(
            response.data.data.map((item: IFileCategory) => ({
              label: item.name,
              value: item.id,
            }))
          );
        }
      } catch (error: unknown) {
        handleAxiosError(error);
      }
    };

    fetchData();
  }, [updateList]);

  // Drag Drop Files
  // useEffect(() => {
  //   if (window) {
  //     uppy.use(DropTarget, {
  //       target: ".page-content",
  //       onDrop: () => uppy.emit("upload"),
  //     });
  //   }

  //   return () => {
  //     uppy.close();
  //   };
  // }, []);

  // Pagination
  useEffect(() => {
    (async () => {
      const response = await ApiFetch.post("/filesLibrary/pagination", {
        pageIndex: page,
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
    if (!categorySelected) {
      toast("Selecione uma categoria para poder fazer upload", {
        type: "error",
      });
      return;
    }

    const files = uppy.getFiles();
    const filePromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("files", file.data, file.name);
      formData.append("categoryId", categorySelected?.value);

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

  const handleAddCategoryModal = () => setShowAddCategoryModal(!showAddCategoryModal);
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

  const handleCategoryFilter = (value: any) => {
    if (value?.value === "all") {
      return setColumnFilters((prev) =>
        prev.filter((x) => x.id !== "categoryId")
      );
    }

    if (columnFilters.filter((x) => x.id === "categoryId").length > 0) {
      setColumnFilters((prev) => prev.filter((x) => x.id !== "categoryId"));

      setColumnFilters((prev) => [
        ...prev,
        {
          id: "categoryId",
          value: value?.value,
        },
      ]);
    } else {
      setColumnFilters((prev) => [
        ...prev,
        {
          id: "categoryId",
          value: value?.value,
        },
      ]);
    }
    setUpdateList((prev) => prev + 1);
  };

  const onSubmitDatePicker = (data: FieldValues) => {
    const values = [
      {
        $d: data.startDate,
      },
      {
        $d: data.endDate,
      },
    ];

    setColumnFilters([
      {
        id: "createdAt",
        value: values,
      },
    ]);

    setDateRange(`${data.startDate} - ${data.endDate}`);
  };

  const onSubmitNewCategory = async (data: FieldValues) => {
    try {
      const response = await ApiFetch.post("/filesLibrary/createCategory", {
        name: data.name,
      });

      if (response.status === 200) {
        setUpdateList((prev) => prev + 1);
        setShowAddCategoryModal(false);
        toast(`A categoria "${data.name}" foi criada com sucesso`, {
          type: "success",
        });
      }
    } catch (error: unknown) {
      handleAxiosError(error, setError);
    }
  };

  const handleModalQuestionDeleteCategory = (category:OptionType) => {
    const deteleCategory = async (id: string) => {
      try {
        const response = await ApiFetch.delete(`/filesLibrary/removeCategory/${id}`);

        if (response.status === 200) { 
          setUpdateList((prev) => prev + 1);
          toast(response.data.message, { type: 'success' });
          closeModal();
          
          handleCategoryFilter({ label: "Todas Categorias", value: "all" });
          setCategorySelectFilter({ label: "Todas Categorias", value: "all" });
        }
      } catch (error: unknown) {
        handleAxiosError(error);
      }
    };

    showModal({
      title: "Remover Categoria",
      body: `Tem certeza que deseja remover a categoria "${category?.label}"`,
      buttons: (
        <>
          <Button variant="danger" onClick={() => deteleCategory(category?.value)}>Excluir</Button>
          <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
        </>
      ) 
    })
  }

  const ModalAddFiles = useCallback(
    () => (
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
          <Form.Group>
            <Form.Label>Categoria:</Form.Label>
            <Select2
              options={categories}
              onChange={(newValue) => {
                if (!Array.isArray(newValue)) {
                  setCategorySelect(newValue);
                }
              }}
              value={categorySelected}
              placeholder="Selecione um item"
            />
          </Form.Group>
          <Dashboard
            className="mt-3"
            uppy={uppy}
            proudlyDisplayPoweredByUppy={false}
            showProgressDetails={true}
            width={"100%"}
          />
        </Modal.Body>
      </Modal>
    ),
    [showAddFilesModal, categories, categorySelected]
  );

  const ModalAddCategory = useCallback(
    () => (
      <Modal
        show={showAddCategoryModal}
        onHide={handleAddCategoryModal}
        centered
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Categoria</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmitNewCategory)}>
            <Form.Group>
              <Form.Label>Nome:</Form.Label>
              <Form.Control
                type="text"
                {...register("name", {
                  required: "É necessário preencher estre campo",
                })}
              />
              {errors?.name?.message && (
                <Form.Text className="text-danger">
                  {errors?.name?.message.toString()}
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mt-3">
              <Button type="submit">Criar Categoria</Button>
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal>
    ),
    [showAddCategoryModal]
  );

  return (
    <MasterLayout>
      <Card className="file-library">
        <Card.Header className="d-flex align-items-center justify-content-between">
          <div className="header-options">
            <Col className="col-12 col-md-6 col-lg-3">
              <TextField
                inputProps={{
                  autoComplete: "new-password", // disable autocomplete and autofill
                }}
                onChange={(event) =>
                  setSearchFilter(event?.currentTarget?.value)
                }
                placeholder="Pesquisar.."
                size="small"
                value={searchFilter ?? ""}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Limpar campo de pesquisa">
                        <span>
                          <IconButton
                            aria-label={"Limpar campo"}
                            disabled={!searchFilter?.length}
                            onClick={() => setSearchFilter("")}
                            size="small"
                          >
                            <MdClose
                              size={24}
                              color={
                                !searchFilter?.length ? "#d0d0d0" : "#212121"
                              }
                            />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </InputAdornment>
                  ),
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdSearch size={24} color="#212121" />
                    </InputAdornment>
                  ),
                  sx: () => ({
                    mb: 0,
                  }),
                }}
              />
            </Col>
            <Col className="col-1 col-3 d-flex justify-content-md-end">
              <Button onClick={handleAddFilesModal}>Adicionar</Button>
            </Col>
          </div>
        </Card.Header>
        <Card.Body>
          <Button className="btn-show-filters mb-3" onClick={handleShowFilters}>
            Filtros
          </Button>

          <div className="filters">
            <div className={`${!showFilters && "d-none"} files-extension`}>
              <Button
                variant={extension === "all" ? "dark" : "outline-dark"}
                onClick={() => filterFileExtensions("all")}
              >
                Tudo
              </Button>
              <Button
                variant={extension === "images" ? "dark" : "outline-dark"}
                onClick={() => filterFileExtensions("images")}
              >
                Imagens
              </Button>
              <Button
                variant={extension === "pdf" ? "dark" : "outline-dark"}
                onClick={() => filterFileExtensions("pdf")}
              >
                PDF
              </Button>
              <Button
                variant={extension === "video" ? "dark" : "outline-dark"}
                onClick={() => filterFileExtensions("video")}
              >
                Vídeos
              </Button>

              <Dropdown>
                <Dropdown.Toggle variant="outline-primary no-arrow">
                  <FaCalendarAlt size={15} /> {dateRange || "Filtrar por Data"}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Form
                    className="p-2"
                    onSubmit={handleSubmit(onSubmitDatePicker)}
                  >
                    <Form.Group>
                      <Form.Label>Data de início</Form.Label>
                      <Form.Control type="date" {...register("startDate")} />
                    </Form.Group>

                    <Form.Group className="mt-2">
                      <Form.Label>Data de fim</Form.Label>
                      <Form.Control type="date" {...register("endDate")} />
                    </Form.Group>

                    <Form.Group className="mt-2 d-flex flex-column gap-2">
                      <Button type="submit">Filtrar</Button>
                      <Button
                        type="reset"
                        variant="danger"
                        onClick={() => {
                          setColumnFilters([]);
                          setDateRange(null);
                        }}
                      >
                        Limpar Filtros
                      </Button>
                    </Form.Group>
                  </Form>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className="categories">
              <InputGroup>
                <Select2
                  options={[
                    { label: "Todas Categorias", value: "all" },
                    ...categories,
                  ]}
                  onChange={(value) => {
                    handleCategoryFilter(value);
                    setCategorySelectFilter(value);
                  }}
                  value={categorySelectedFilter}
                  placeholder="Selecione um item"
                  isSearchable={false}
                />
                <Dropdown>
                  <Dropdown.Toggle variant="primary no-arrow">
                    <FaEllipsisVertical size={18} />
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={handleAddCategoryModal}>Adicionar Categoria</Dropdown.Item>
                    {categorySelectedFilter?.value !== 'all' && <Dropdown.Item onClick={() => handleModalQuestionDeleteCategory(categorySelectedFilter)}>Remover Categoria Selecionada</Dropdown.Item>}
                  </Dropdown.Menu>
                </Dropdown>
              </InputGroup>
            </div>
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
      <ModalAddCategory />
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
