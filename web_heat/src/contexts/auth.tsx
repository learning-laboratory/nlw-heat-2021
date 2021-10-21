import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type User = {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
};

type AuthContextData = {
  user: User | null;
  singInUrl: string;
  signOut: () => void;
};

type AuthProvider = {
  children: ReactNode;
};

type AuthResponse = {
  token: string;
  user: {
    id: string;
    avatar_url: string;
    name: string;
    login: string;
  };
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider(props: AuthProvider) {
  const [user, setUser] = useState<User | null>(null);
  const singInUrl = `https://github.com/login/oauth/authorize?client_id=b82f83afa1b4e3c810c6`;

  async function signIn(githubCode: string) {
    const response = await api.post<AuthResponse>("authenticate", {
      code: githubCode,
    });

    const { token, user } = response.data;
    localStorage.setItem("@doWhile:token", token);
    api.defaults.headers.common.authorization = `Bearer ${token}`;
    setUser(user);
  }

  async function signOut() {
    setUser(null);
    localStorage.removeItem("@doWhile:token");
  }

  useEffect(() => {
    const token = localStorage.getItem("@doWhile:token");
    if (token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;
      api.get("profile").then((response) => {
        setUser(response.data);
      });
    }
  }, []);

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes("code=");
    if (hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split("?code=");
      window.history.pushState({}, "", urlWithoutCode);
      signIn(githubCode);
    }
  });

  return (
    <AuthContext.Provider value={{ singInUrl, signOut, user }}>
      {props.children}
    </AuthContext.Provider>
  );
}
