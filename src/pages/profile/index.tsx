import React, { useContext, useEffect, useState } from "react";
import { MasterLayout } from "@components";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import { AuthContext } from "src/contexts/AuthContext";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import ApiFetch from "src/api";
import { IUser } from "src/interfaces/IUser";
import { FieldValues, useForm } from "react-hook-form";
import handleAxiosError from "src/utils/handleAxiosError";
import { toast } from "react-toastify";
import { closeModal, showModal } from "src/events";

export default function Profile(): JSX.Element {
  const [disableUpdateButton, setDisableUpdateButton] = useState<boolean>(false);
  const [modalChangePassword, setModalChangePassword] = useState<boolean>(false);
  const { user, signOut } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm({ criteriaMode: "all" });

  useEffect(() => {
    if (user) {
        setValue('name', user.name, { shouldValidate: true });
        setValue('email', user.email, { shouldValidate: true });
    }
  }, [user]);

  const updateUser = async ({ name }: FieldValues): Promise<void> => {
    try {
      const response = await ApiFetch.put('/user/update', { 
        name,
      });

      toast(response.data.message, { type: 'success' });
      setDisableUpdateButton(true);
    } catch (error: unknown) {
      handleAxiosError(error, setError);
    } 

    closeModal();
  }

  const changePassword = async ({ currentPassword, password, confirmPassword }: FieldValues): Promise<void> => {
    try {
      const response = await ApiFetch.post('/user/changePassword', { 
        currentPassword,
        password,
        confirmPassword,
      });

      toast(response.data.message, { type: 'success' });
      signOut();
    } catch (error: unknown) {
      handleAxiosError(error, setError);
    } 
  }

  const onSubmit = (props: FieldValues): void => {
    showModal({
      title: 'Atualizar informações de usuário',
      body: 'Tem certeza de que deseja atualizar as informações para esse usuário?',
      buttons: (
        <>
          <Button variant="primary" onClick={() => updateUser(props)}>Atualizar</Button>
          <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
        </>
      )
    })
  };

  const toggleModalChangePassword = () => setModalChangePassword(!modalChangePassword);

  const ModalChangePassword = () => {
    return (
      <Modal
        show={modalChangePassword}
        onHide={toggleModalChangePassword}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Redefinir senha</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(changePassword)}>
            <Form.Group>
              <Form.Label>Senha atual</Form.Label>
              <Form.Control
                type="password"
                {...register("currentPassword")}
              />
              {errors?.currentPassword && (
                <Form.Text className="text-danger">
                  {errors.currentPassword?.message?.toString()}
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>Nova senha</Form.Label>
              <Form.Control
                type="password"
                {...register("password")}
              />
              {errors?.password && (
                <Form.Text className="text-danger">
                  {errors.password?.message?.toString()}
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>Confirme a nova senha</Form.Label>
              <Form.Control
                type="password"
                {...register("confirmPassword")}
              />
              {errors?.confirmPassword && (
                <Form.Text className="text-danger">
                  {errors.confirmPassword?.message?.toString()}
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Text>Ao <strong>Redefinir</strong> sua senha, você será redirecionado à tela de login para logar-se novamente.</Form.Text>
            </Form.Group>
            <Form.Group className="mt-2 d-flex justify-content-end">
              <Button type="submit" variant="primary">
                Redefinir
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={toggleModalChangePassword}
                className="mx-2"
              >
                Cancelar
              </Button>
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <MasterLayout>
      <Card>
        <Card.Header>Meu perfil</Card.Header>
        <Card.Body>
          <Row>
            <Col className="col-12 col-md-10 col-lg-6">
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group>
                  <Form.Label>Nome de usuário</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="João Silva"
                    {...register("name")}
                  />
                  {errors?.name && <Form.Text className="text-danger">{errors.name?.message?.toString()}</Form.Text>}
                </Form.Group>
                <Form.Group className="mt-2">
                  <Form.Label>Endereço de email</Form.Label>
                  <Form.Control
                    disabled
                    type="email"
                    placeholder="exemplo@dominio.com"
                    {...register("email")}
                  />
                </Form.Group>
                <Form.Group className="mt-2">
                  <Button variant="dark" className="w-100" type="button" onClick={toggleModalChangePassword}>
                    Redefinir senha
                  </Button>
                </Form.Group>
                <Form.Group className="mt-3">
                  <Button 
                    disabled={disableUpdateButton}
                    variant="primary"
                    type="submit">
                    Atualizar informações
                  </Button>
                </Form.Group>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <ModalChangePassword />
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
