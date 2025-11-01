
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import logoFastResto from "../assets/images/logoFastResto.png";

export default function Sidebar({ activeKey = "overview", onSelect = () => {}, hasUnseen = false }) {
  return (
    <div
      className="bg-dark shadow-sm d-flex flex-column justify-content-between"
      style={{ width: "260px", height: "100vh", position: "fixed", top: 0, left: 0, overflow: "hidden", zIndex: 1020 }}
    >
      <div>
        {/* Logo */}
        <div className="p-4 border-bottom d-flex align-items-center">
          {/* <h4 className="fw-bold m-0 text-dark">FastResto</h4> */}
          <img src={logoFastResto} alt="FastResto" style={{ height: 40, width: 'auto' }} />
        </div>

        {/* Menu principal (simplifié selon maquette) */}
        <div className="mt-3">
          <ul className="nav flex-column">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link text-start ps-4 w-100 ${
                  activeKey === "overview" ? "active bg-light fw-semibold text-primary" : "text-white"
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
                  activeKey === "plats" ? "active bg-light fw-semibold text-primary" : "text-white"
                }`}
                onClick={() => onSelect("plats")}
              >
                Menu
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link text-start ps-4 w-100 ${
                  activeKey === "commandes" ? "active bg-light fw-semibold text-primary" : "text-white"
                }`}
                onClick={() => onSelect("commandes")}
              >
                Commande
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link text-start ps-4 w-100 ${
                  activeKey === "tables" ? "active bg-light fw-semibold text-primary" : "text-white"
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
                  activeKey === "settings" ? "active bg-light fw-semibold text-primary" : "text-white"
                }`}
                onClick={() => onSelect("settings")}
              >
                Paramètres
              </button>
            </li>
          </ul>
        </div>
      </div>

      
    </div>
  );
}
