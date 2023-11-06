import React from "react";
import type { AppProps } from "next/app";
import "@styles/globals.scss";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import 'react-toastify/dist/ReactToastify.css';

import { ProgressBar } from "@components";
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from "src/contexts/AuthContext";

config.autoAddCss = false;

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default MyApp;
