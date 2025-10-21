import React, { useState } from "react";
import { connect } from "../services/login_agent";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await connect(email, motDePasse);

    if (result.token) {
      setMessage("Connexion réussie !");
      localStorage.setItem("token", result.token);
      // Notifier l'application qu'on est connecté
      window.dispatchEvent(new Event("login-success"));
    } else {
      setMessage(result);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100 vw-100"
      style={{
        background:
          'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1600&q=80") center/cover no-repeat',
      }}
    >
      <div className="container px-3">
        <div
          className="mx-auto bg-white p-4 p-md-5 shadow-lg rounded-4"
          style={{
            maxWidth: "420px",
            width: "100%",
          }}
        >
          <h3
            className="text-center mb-4 fw-bold"
            style={{ color: "#6b9bd1" }}
          >
            Connexion Restaurant
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label className="form-label fw-semibold">Adresse e-mail</label>
              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label fw-semibold">Mot de passe</label>
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="Password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-lg w-100"
              style={{
                backgroundColor: "#6b9bd1",
                color: "white",
                borderRadius: "10px",
                fontWeight: "600",
              }}
            >
              Se connecter
            </button>
          </form>

          {message && (
            <div className="text-center mt-3">
              <p
                className={`fw-semibold ${
                  message.includes("réussie") ? "text-success" : "text-danger"
                }`}
              >
                {message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
