import { useEffect, useMemo, useState } from "react";
import Section from "../component/common/Section.jsx";
import {
  listTables,
  createTable,
  deleteTable,
  updateTable,
  markTableAsAvailable,
} from "../services/api_tables.jsx";

export default function Tables() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [total, setTotal] = useState(0);
  const [qrSeeds, setQrSeeds] = useState({});
  const [etat, setEtat] = useState("");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const guestBase = (import.meta.env.VITE_GUEST_BASE_URL || "http://localhost:5173").replace(/\/$/, "");
  const qrSrc = (text, seed = 0) => {
    const target = `${guestBase}/t/${encodeURIComponent(String(text))}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(target)}&bgcolor=ffffff&margin=2&format=png&cb=${seed}`;
  };

  const fetchTables = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listTables({ page, limit });
      console.log(res);
      setItems(res || []);
      setTotal(res?.total || 0);
      // init seeds for qr refresh
      const seeds = {};
      (res?.items || []).forEach((t) => (seeds[t._id] = 0));
      setQrSeeds(seeds);
    } catch (e) {
      setError("Erreur lors du chargement des tables");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (src, title = "QR Table") => {
    const w = window.open("", "printWindow");
    if (!w) return;
    const html = `<!doctype html><html><head><title>${title}</title>
      <meta charset="utf-8"/>
      <style>
        @page { size: auto; margin: 10mm; }
        body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh}
        img{width:256px;height:256px}
      </style>
    </head><body>
      <img src="${src}" alt="${title}" onload="window.focus(); window.print(); setTimeout(()=>window.close(), 300);"/>
    </body></html>`;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  useEffect(() => {
    fetchTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleCreate = async (data) => {
    setLoading(true);
    setError("");
    try {
      await createTable(data);
      await fetchTables();
    } catch (e) {
      setError(typeof e === "string" ? e : "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette table ?")) return;
    try {
      await deleteTable(id);
      await fetchTables();
    } catch (e) {
      alert("Suppression impossible");
    }
  };

  const handleToggle = async (id) => {
    const t = items.find((x) => x._id === id);
    const isLibre = t ? (typeof t.statut === 'string' ? t.statut === 'libre' : !!t.disponible) : false;
    const nextStatut = isLibre ? 'occupee' : 'libre';
    try {
      await markTableAsAvailable(id, nextStatut);
    } finally {
      await fetchTables();
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      await updateTable(id, payload);
      await fetchTables();
    } catch (e) {
      alert("Mise à jour impossible");
    }
  };

  return (
    <Section title="Tables">
      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2" />
        <small className="text-muted">
          Page {page} / {totalPages} • {total} au total
        </small>
        <div className="d-flex align-items-center gap-3">
          <select className="form-select form-select-sm bg-dark text-white border-0" style={{ width: 140 }} value={etat} onChange={(e)=>{ setEtat(e.target.value); }}>
            <option value="">Toutes</option>
            <option value="libre">Libres</option>
            <option value="occupee">Occupées</option>
          </select>
          <button
            className="btn btn-sm btn-danger d-flex align-items-center gap-1"
            data-bs-toggle="modal"
            data-bs-target="#modalTableForm"
          >
            <i className="bi bi-plus-lg" /> Nouvelle table
          </button>
          <label className="text-muted">Afficher</label>
          <select
            className="form-select form-select-sm"
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
            style={{ width: 90 }}
          >
            <option value={6}>6</option>
            <option value={8}>8</option>
            <option value={12}>12</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-center py-5">Chargement...</div>}
      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="row">
          {items
            .filter((t)=>{
              const isLibre = typeof t.statut === 'string' ? t.statut === 'libre' : !!t.disponible;
              if (!etat) return true;
              return etat === 'libre' ? isLibre : !isLibre;
            })
            .map((t) => (
            <div key={t._id} className="col-sm-6 col-lg-4 col-xxl-3 mb-3">
              <div className="card h-100 shadow border-0 rounded-4 overflow-hidden bg-dark text-white">
                <div className="p-4 d-flex justify-content-center">
                  <div className="bg-light p-2 rounded-3">
                    <img
                      src={qrSrc(t.numero ?? t._id, qrSeeds[t._id] || 0)}
                      alt={`QR Table ${t.numero ?? t._id}`}
                      style={{ width: 160, height: 160 }}
                    />
                  </div>
                </div>
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="mb-0">Table {t.numero ?? t.name ?? t._id.substring(0, 6)}</h6>
                    <span className={`badge ${(typeof t.statut === 'string' ? t.statut === 'libre' : !!t.disponible) ? "text-bg-success" : "text-bg-danger"}`}>
                      {(typeof t.statut === 'string' ? t.statut === 'libre' : !!t.disponible) ? "libre" : "occupee"}
                    </span>
                  </div>
                  <div className="d-flex gap-2 mb-3">
                    <button className="btn btn-sm btn-outline-light rounded-pill px-3 d-flex align-items-center gap-2" onClick={() => handlePrint(qrSrc(t.numero ?? t._id, qrSeeds[t._id] || 0), `Table ${t.numero ?? t._id}`)}>
                      <i className="bi bi-printer" /> Imprimer QR
                    </button>
                    <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-2" onClick={() => handleToggle(t._id)}>
                      <i className="bi bi-toggle2-on" /> Basculer état
                    </button>
                  </div>
                  <div className="rounded-3 px-3 py-2 d-flex justify-content-center" style={{ background: '#1c1c1c', border: '1px solid #2a2a2a' }}>
                    <button className="btn btn-sm text-danger d-flex align-items-center gap-2" onClick={() => handleDelete(t._id)}>
                      <i className="bi bi-trash" /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Précédent
          </button>
          <span className="text-muted small">
            Page {page} / {totalPages}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Suivant
          </button>
        </div>
      )}

      {/* Modal de création / édition */}
      <TableFormModal
        onSubmit={async (form) => {
          if (form._id) {
            await handleUpdate(form._id, { numero: form.numero });
          } else {
            await handleCreate({ numero: form.numero });
          }
          window.__editTable = null;
        }}
        onHidden={() => (window.__editTable = null)}
      />

    </Section>
  );
}

function TableFormModal({ onSubmit, onHidden }) {
  const [numero, setNumero] = useState("");

  useEffect(() => {
    const handler = () => {
      const t = window.__editTable;
      setNumero(t?.numero ?? "");
    };

    // Bootstrap modal events
    const el = document.getElementById("modalTableForm");
    if (!el) return;
    el.addEventListener("show.bs.modal", handler);
    el.addEventListener("hidden.bs.modal", onHidden);
    return () => {
      el.removeEventListener("show.bs.modal", handler);
      el.removeEventListener("hidden.bs.modal", onHidden);
    };
  }, [onHidden]);

  return (
    <div className="modal fade" id="modalTableForm" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{window.__editTable ? "Modifier la table" : "Nouvelle table"}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit({ _id: window.__editTable?._id, numero });
              document.querySelector('#modalTableForm [data-bs-dismiss="modal"]').click();
            }}
          >
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Numéro</label>
                <input className="form-control" value={numero} onChange={(e) => setNumero(e.target.value)} required />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" className="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
