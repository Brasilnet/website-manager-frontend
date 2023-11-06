import React, { createContext, useEffect, useState } from "react";
import moment from "moment";
import ApiFetch from "src/api";
import { IUser } from "src/interfaces/IUser";
import { setCookie, parseCookies, destroyCookie } from "nookies";
import Router from "next/router";
import { toast } from "react-toastify";

interface IChildren {
  children?: JSX.Element | JSX.Element[] | null;
}

interface ISignInData {
  email: string;
  password: string;
}

interface IAuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  signIn: (data: ISignInData) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext({} as IAuthContextType);

export function AuthProvider({ children }: IChildren) {
  const [user, setUser] = useState<IUser | null>(null);

  const isAuthenticated = !!user;

  const signIn = async ({ email, password }: ISignInData) => {
    const response = await ApiFetch.post("/auth/login", { email, password });
    const user: IUser = response.data;

    const { accessToken } = user.token;

    const expiresInUTC = moment.utc(user.token.expiresIn, "DD/MM/YYYY HH:mm:ss").toDate();

    setCookie(null, "brasilnet-manager.token", accessToken, {
      expires: expiresInUTC
    });

    setUser(user);

    ApiFetch.defaults.headers["Authorization"] = `Bearer ${accessToken}`;

    Router.push("/");
  };

  const signOut = async () => {
    destroyCookie(undefined, "brasilnet-manager.token");
    setUser(null);
    ApiFetch.defaults.headers["Authorization"] = null;
    Router.push("/login");
  }

  useEffect(() => {
    const { "brasilnet-manager.token": token } = parseCookies();

    if (token) {
      ApiFetch.get("/user").then((response) => {
        const user: IUser = response.data;
        setUser(user);
      }).catch((response) => {
        toast(response.data.errorMessage, { type: 'error' });
      })
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
