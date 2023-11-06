/* eslint-disable import/no-unresolved */
import React, { useContext, useRef, useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { FieldValues, useForm } from "react-hook-form";
import app from "src/config/app";
import handleAxiosError from "src/utils/handleAxiosError";
import { AuthContext } from "src/contexts/AuthContext";
import ApiFetch from "src/api";
import { toast } from "react-toastify";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { IShowAlert } from "src/interfaces/ILogin";

export default function Login() {
  const [spinner, setSpinner] = useState(false);
  const [enableForgotPassword, setEnableForgotPassword] = useState(true);
  const [showAlert, setShowAlert] = useState<IShowAlert | null>({
    visible: false,
    message: '',
  });

  const { signIn } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm({ criteriaMode: "all" });

  const onSubmit = async ({ email, password }: FieldValues): Promise<void> => {
    try {
      setShowAlert({
        visible: false,
        message: null,
      });
      
      await signIn({ email, password });
    } catch (error: unknown) {
      handleAxiosError(error, setError, setShowAlert);
    } 
  };
  
  const forgotPassword = async (): Promise<void> => {
    setEnableForgotPassword(false);
    try {
      // Get email from form
      const { email } = getValues();

      const response = await ApiFetch.post('/auth/forgotPassword', { email });
      toast(response.data.message, { type: 'success' });
    } catch (error: unknown) {
      handleAxiosError(error, setError);
    } 
  };

  return (
    <div className="login">
      <Row>
        <Col className="col-md-5">
          <Container>
            <Row className="vh-100 d-flex justify-content-center align-content-center">
              <Col className="col-12 col-lg-10 col-xl-8">
                <Row className="d-flex justify-content-center">
                  <img alt="logo" className="logo-md" src={app.logo.dark} />
                </Row>
                <Row className="mt-3">
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    <h2>Entrar na plataforma</h2>
                    <h5>{app.title}</h5>
                    <Form.Group className="mt-2">
                      {
                        showAlert && showAlert.visible && (
                          <Alert variant="danger">{showAlert.message}</Alert>
                        )
                      }
                    </Form.Group>
                    <Form.Group className="mt-2">
                      <Form.Label>Endereço de email</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaUser size={16} color="#6a6a6a" />
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          placeholder="exemplo@dominio.com"
                          {...register("email", {
                            required: "Esse campo é necessário.",
                          })}
                        />
                      </InputGroup>
                      {errors?.email && <Form.Text className="text-danger">{errors.email?.message?.toString()}</Form.Text>}
                    </Form.Group>

                    <Form.Group className="mt-2">
                      <Form.Label>Senha</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaLock size={16} color="#6a6a6a" />
                        </InputGroup.Text>
                        <Form.Control
                          type="password"
                          placeholder="Digite sua senha.."
                          {...register("password", {
                            required: "Esse campo é necessário.",
                          })}
                        />
                      </InputGroup>
                      {errors?.password && <Form.Text className="text-danger">{errors.password?.message?.toString()}</Form.Text>}
                    </Form.Group>

                    <Form.Group className="mt-3 d-grid">
                      <Button variant="primary" type="submit">
                        {spinner && (
                          <Spinner
                            className="mx-2"
                            animation="border"
                            size="sm"
                          />
                        )}
                        ENTRAR
                      </Button>
                    </Form.Group>

                    <Form.Group className="mt-2 d-flex justify-content-end">
                      <Form.Label
                        className={`forgot-password ${!enableForgotPassword ? 'disabled' : ''}`}
                        onClick={
                          enableForgotPassword ? forgotPassword : undefined
                        }
                        title={enableForgotPassword ? 'Solicite um email para redefinir sua senha' : 'Já foi enviado um email para redefinir sua senha'}
                      >
                        Esqueceu sua senha?
                      </Form.Label>
                    </Form.Group>
                  </Form>
                </Row>
              </Col>
            </Row>
          </Container>
        </Col>
        <Col
          className="d-none d-md-block"
          style={{
            background: `url(${app.images.main_image})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </Row>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { ['brasilnet-manager.token']: token } = parseCookies(ctx);

  if (token) {
      return {
          redirect: {
              destination: '/',
              permanent: false,
          }
      };
  }

  return {
      props: {},
  };
}
