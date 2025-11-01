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
  const [hasUnseen, setHasUnseen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || 'dark'; } catch (_) { return 'dark'; }
  });

  React.useEffect(() => {
    const onNew = () => {
      if (document.hidden || activeKey !== 'notifications') {
        setHasUnseen(true);
        setNotifCount((n) => n + 1);
      }
    };
    const onSeen = () => { setHasUnseen(false); setNotifCount(0); };
    window.addEventListener('notif:new', onNew);
    window.addEventListener('notif:seen', onSeen);
    return () => {
      window.removeEventListener('notif:new', onNew);
      window.removeEventListener('notif:seen', onSeen);
    };
  }, [activeKey]);

  React.useEffect(() => {
    if (activeKey === 'notifications') setHasUnseen(false);
  }, [activeKey]);

  // Apply theme to document
  React.useEffect(() => {
    try { localStorage.setItem('theme', theme); } catch (_) {}
    document.body.classList.toggle('theme-light', theme === 'light');
    document.body.classList.toggle('theme-dark', theme === 'dark');
  }, [theme]);

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
    <div className="d-flex" style={{ minHeight: "100vh", width:"100vw", background: "#000000" }}>
      <Sidebar activeKey={activeKey} onSelect={(k) => { if (k === 'notifications') setHasUnseen(false); setActiveKey(k); }} hasUnseen={hasUnseen} />

      <div className="flex-grow-1" style={{ marginLeft: 260 }}>
        <Header notifCount={notifCount} setNotifCount={setNotifCount} />
        <main className="p-5" style={{ paddingTop: 148, background: "linear-gradient(180deg, #A00000 0%, #000000 100%)" }}>{renderContent()}</main>
      </div>
    </div>
  );
}

function Header({ notifCount, setNotifCount }) {
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
    const onProfileUpdated = async () => {
      try {
        const u = await getMe();
        if (mounted) setMe(u);
      } catch (_) {}
    };
    window.addEventListener('profile:updated', onProfileUpdated);
    return () => { mounted = false; };
  }, []);

  // derive API root for avatar
  const raw = import.meta.env.VITE_url_api || 'http://localhost:4000/api/v1';
  const apiRoot = (raw.endsWith('/api/v1') ? raw.slice(0, -7) : raw.replace(/\/$/, ''));
  const cache = me?.photo ? `?cb=${Date.now()}` : '';
  const avatarSrc = me?.photo ? `${apiRoot}${me.photo}${cache}` : undefined;

  return (
    <header className="bg-dark text-white px-4 py-3 border-bottom" style={{ position: 'fixed', top: 0, left: 260, right: 0, zIndex: 1030 }}>
      <div className="d-flex align-items-center justify-content-between">
        {/* Left: Greeting */}
        <div className="d-flex flex-column">
          <div className="fw-semibold">Bienvenue, {me?.nom || ""} <span className="ms-1">👋</span></div>
          <small className="text-white-50">{me?.role ? `Gérant • ${me.role}` : "Gérant"}</small>
        </div>

        {/* Center: Search */}
        <div className="flex-grow-1 px-4" style={{ maxWidth: 720 }}>
          <div className="input-group">
            <span className="input-group-text bg-secondary border-0 text-white-50"><i className="bi bi-search" /></span>
            <input className="form-control bg-secondary border-0 text-white" placeholder="Rechercher" />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="d-flex align-items-center gap-3 position-relative">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-circle p-2"
            title="Réglages"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          >
            <i className="bi bi-gear" />
          </button>
          <div className="position-relative">
            <button type="button" className="btn btn-sm btn-outline-secondary rounded-circle p-2" title="Notifications" onClick={() => { setNotifCount(0); window.dispatchEvent(new Event('notif:seen')); }}>
              <i className="bi bi-bell" />
            </button>
            {notifCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {notifCount}
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label="Profil"
            className="btn p-0 border-0 bg-transparent d-flex align-items-center"
            onClick={() => setOpen((v) => !v)}
          >
            <img
              src={avatarSrc || 'https://via.placeholder.com/40x40.png?text=%20'}
              alt="avatar"
              height={40}
              width={40}
              className="rounded-circle"
            />
            <span className="ms-2 small text-white-50 d-none d-sm-inline">Gérant</span>
          </button>

          {open && (
            <div
              className="position-absolute end-0 mt-2 bg-dark text-white border rounded-3 shadow-sm"
              style={{ top: "100%", minWidth: 180 }}
            >
              <button className="dropdown-item w-100 text-start py-2 text-white" onClick={handleLogout}>
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}