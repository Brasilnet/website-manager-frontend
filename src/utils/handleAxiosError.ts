import axios, { AxiosError } from 'axios';
import { FieldValues, UseFormSetError } from 'react-hook-form';
import { toast } from 'react-toastify';
import { IShowAlert } from 'src/interfaces/ILogin';

interface ErrorResponse {
  errors?: Record<string, string[]>;
  errorMessage?: string;
}

export default function handleAxiosError(
  error: unknown,
  setError?: UseFormSetError<FieldValues>,
  setShowAlert?: React.Dispatch<React.SetStateAction<IShowAlert | null>>
): void {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    const response = axiosError.response;

    // Validations (Bad-Request)
    if (response && response.status === 400 && setError) {
      const responseErrors = response.data.errors;
      for (const field in responseErrors) {
        if (responseErrors.hasOwnProperty(field)) {
          const firstErrorMessage = responseErrors[field][0] || '';
          setError(field as keyof FieldValues, {
            type: "manual",
            message: firstErrorMessage
          }, { shouldFocus: true });
        }
      }
    }

    // Unauthorized
    if (response && response.status === 401) {
      setShowAlert ? setShowAlert({
        visible: true,
        message: response.data.errorMessage,
      }) : toast(response.data.errorMessage, { type: 'error' });
    }

    // Not Found
    if (response && response.status === 404) {
      setShowAlert ? setShowAlert({
        visible: true,
        message: response.data.errorMessage,
      }) : toast(response.data.errorMessage, { type: 'error' });
    }

    if (axiosError.code === 'ERR_NETWORK') {
      toast('Houve um erro na conexão com o servidor, tente novamente mais tarde', { type: 'error' });
    }
  } else {
    toast('Houve um erro interno, tente novamente mais tarde', { type: 'error' });
  }
}
