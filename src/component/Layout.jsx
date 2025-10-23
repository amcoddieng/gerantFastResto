import React, { useState } from "react";
import Sidebar from "./Menu.jsx";
import Overview from "../views/Overview.tsx";
import Plats from "../views/Plats.jsx";
import Tables from "../views/Tables.jsx";
import Messages from "../views/Messages.tsx";
import Notifications from "../views/Notifications.tsx";
import Settings from "../views/Settings.jsx";
import Commandes from "../views/Commandes.tsx";
import { getMe } from "../services/api_users.jsx";

export default function Layout() {
  const [activeKey, setActiveKey] = useState("overview");

  const renderContent = () => {
    switch (activeKey) {
      case "overview":
        return <Overview />;
      case "plats":
        return <Plats />;
      case "tables":
        return <Tables />;
      case "commandes":
        return <Commandes />;
      case "messages":
        return <Messages />;
      case "notifications":
        return <Notifications />;
      case "settings":
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh",width:"100vw", background: "#000000" }}>
      <Sidebar activeKey={activeKey} onSelect={setActiveKey} />

      <div className="flex-grow-1">
        <Header />
        <main className="p-4">{renderContent()}</main>
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(null);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
    } catch (_) {}
    window.dispatchEvent(new Event("logout"));
    setOpen(false);
  };

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await getMe();
        if (mounted) setMe(u);
      } catch (e) {
        // Ne déconnecte que si non autorisé; sinon, on ignore l'erreur de profil
        if (e === "Unauthorized" || (e && e.status === 401)) {
          try { localStorage.removeItem("token"); } catch (_) {}
          window.dispatchEvent(new Event("logout"));
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <header className="bg-dark d-flex align-items-center justify-content-between px-4 py-3 border-bottom sticky-top">
      <div>
        <h4 className="m-0 fw-bold">Gerant Fast Resto</h4>
        <small className="text-muted">Bonjour {me?.nom || ""}{!me?.nom ? "" : ","} bienvenue{me?.role ? ` • ${me.role}` : ""} !</small>
      </div>
      <div className="d-flex align-items-center gap-3 position-relative">
        <input className="form-control" placeholder="Rechercher" style={{ width: 260 }} />
        <div className="d-flex align-items-center">
          {/* <span className="badge text-bg-light me-3">🛒</span> */}
          <button
            type="button"
            aria-label="Profil"
            className="btn p-0 border-0 bg-transparent"
            onClick={() => setOpen((v) => !v)}
          >
            {/* console.log(me.photo) */}
            
            <img
              src={`http://192.168.1.13:4000${me?.photo}`}
              alt="avatar"
              height={40}
              width={40}
              className="rounded-circle"
              // onError={(e) => {
              //   e.currentTarget.onerror = null;
              //   e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(me?.nom || "U")}`;
              // }}
            />
          </button>
        </div>

        {open && (
          <div
            className="position-absolute end-0 mt-2 bg-dark border rounded-3 shadow-sm"
            style={{ top: "100%", minWidth: 180 }}
          >
            <button className="dropdown-item w-100 text-start py-2" onClick={handleLogout}>
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </header>
  );
}