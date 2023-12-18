import axios from "axios";
import { parseCookies } from "nookies";


const { "brasilnet-manager.token": token } = parseCookies();

const ApiFetch = axios.create({
 baseURL: process.env.NEXT_PUBLIC_API_HOST,
});

ApiFetch.interceptors.response.use(
    response => {
      return response;
    },
    error => {
      return Promise.reject(error);
    }
);

if (token) {
  ApiFetch.defaults.headers["Authorization"] = `Bearer ${token}`;
}

export default ApiFetch;