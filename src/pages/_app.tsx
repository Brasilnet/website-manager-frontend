import React from "react";
import type { AppProps } from "next/app";

import "@styles/globals.scss";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import 'react-toastify/dist/ReactToastify.css';
import "primereact/resources/themes/lara-light-cyan/theme.css";


import { ProgressBar } from "@components";
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from "src/contexts/AuthContext";
import { PrimeReactProvider } from 'primereact/api';

config.autoAddCss = false;

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <AuthProvider>
      <PrimeReactProvider>
        <ProgressBar />
        <ToastContainer
          position="top-left"
          autoClose={5000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <Component {...pageProps} />
      </PrimeReactProvider>
    </AuthProvider>
  );
}

export default MyApp;
