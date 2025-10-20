
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";

export default function Sidebar() {
  return (
    <div
      className="bg-white shadow-sm d-flex flex-column justify-content-between"
      style={{ width: "260px" }}
    >
      <div>
        {/* Logo */}
        <div className="p-4 border-bottom d-flex align-items-center">
          <div
            className="bg-warning rounded-3 me-2"
            style={{ width: "32px", height: "32px" }}
          ></div>
          <h4 className="fw-bold m-0 text-dark">FastResto</h4>
        </div>

        {/* Menu principal */}
        <div className="mt-3">
          <p className="text-muted text-uppercase px-4 small fw-bold">
            Main Menu
          </p>
          <ul className="nav flex-column">
            <li className="nav-item">
              <a className="nav-link active bg-light fw-semibold ps-4 text-primary">
                Vue d’ensemble
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link ps-4 text-dark">Plats</a>
            </li>
            <li className="nav-item">
              <a className="nav-link ps-4 text-dark">Tables</a>
            </li>
            <li className="nav-item">
              <a className="nav-link ps-4 text-dark">Commandes</a>
            </li>
            <li className="nav-item">
              <a className="nav-link ps-4 text-dark">Messages</a>
            </li>
          </ul>

          <p className="text-muted text-uppercase px-4 small fw-bold mt-4">
            Others
          </p>
          <ul className="nav flex-column mb-4">
            <li className="nav-item">
              <a className="nav-link ps-4 text-dark">Notifications</a>
            </li>
            <li className="nav-item">
              <a className="nav-link ps-4 text-dark">Paramètres</a>
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
