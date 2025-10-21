import React, { useEffect, useState } from "react";
import Connexion from "./connexion.jsx";
import Layout from "./Layout.jsx";

export default function AppShell() {
  const [authenticated, setAuthenticated] = useState(() => !!localStorage.getItem("token"));

  useEffect(() => {
    const onLogin = () => setAuthenticated(true);
    const onLogout = () => setAuthenticated(false);
    const onStorage = (e) => {
      if (e.key === "token") setAuthenticated(!!e.newValue);
    };
    window.addEventListener("login-success", onLogin);
    window.addEventListener("logout", onLogout);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("login-success", onLogin);
      window.removeEventListener("logout", onLogout);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
console.log("authenticated", authenticated);
  return authenticated ? <Layout /> : <Connexion />;
}