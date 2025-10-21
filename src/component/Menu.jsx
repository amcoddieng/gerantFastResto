
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";

export default function Sidebar({ activeKey = "overview", onSelect = () => {} }) {
  return (
    <div
      className="bg-white shadow-sm d-flex flex-column justify-content-between"
      style={{ width: "260px", minHeight: "100vh" }}
    >
      <div>
        {/* Logo */}
        <div className="p-4 border-bottom d-flex align-items-center">
          <div
            className="bg-warning rounded-3 me-2"
            style={{ width: "32px", height: "32px" }}
          ></div>
          {/* <h4 className="fw-bold m-0 text-dark">FastResto</h4> */}
          <img src="../../public/WhatsApp Image 2025-10-20 at 17.05.35_a7d0d7ad.jpg" height={50} width={100}/>
        </div>

        {/* Menu principal */}
        <div className="mt-3">
          <p className="text-muted text-uppercase px-4 small fw-bold">
            Main Menu
          </p>
          <ul className="nav flex-column">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link text-start ps-4 w-100 ${
                  activeKey === "overview" ? "active bg-light fw-semibold text-primary" : "text-dark"
                }`}
                onClick={() => onSelect("overview")}
              >
                Vue d’ensemble
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link text-start ps-4 w-100 ${
                  activeKey === "plats" ? "active bg-light fw-semibold text-primary" : "text-dark"
                }`}
                onClick={() => onSelect("plats")}
              >
                Plats
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link text-start ps-4 w-100 ${
                  activeKey === "tables" ? "active bg-light fw-semibold text-primary" : "text-dark"
                }`}
                onClick={() => onSelect("tables")}
              >
                Tables
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link text-start ps-4 w-100 ${
                  activeKey === "commandes" ? "active bg-light fw-semibold text-primary" : "text-dark"
                }`}
                onClick={() => onSelect("commandes")}
              >
                Commandes
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link text-start ps-4 w-100 ${
                  activeKey === "messages" ? "active bg-light fw-semibold text-primary" : "text-dark"
                }`}
                onClick={() => onSelect("messages")}
              >
                Messages
              </button>
            </li>
          </ul>

          <p className="text-muted text-uppercase px-4 small fw-bold mt-4">
            Others
          </p>
          <ul className="nav flex-column mb-4">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link text-start ps-4 w-100 ${
                  activeKey === "notifications" ? "active bg-light fw-semibold text-primary" : "text-dark"
                }`}
                onClick={() => onSelect("notifications")}
              >
                Notifications
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link text-start ps-4 w-100 ${
                  activeKey === "settings" ? "active bg-light fw-semibold text-primary" : "text-dark"
                }`}
                onClick={() => onSelect("settings")}
              >
                Paramètres
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Profil */}
      <div className="border-top p-4 d-flex align-items-center">
        <img
          src="https://i.pravatar.cc/40"
          alt="avatar"
          className="rounded-circle me-2"
        />
        <div>
          <p className="m-0 fw-semibold">Amadou</p>
          <small className="text-muted">Admin</small>
        </div>
      </div>
    </div>
  );
}
