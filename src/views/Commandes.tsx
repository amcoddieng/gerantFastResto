import Section from "../component/common/Section.jsx";
import { useEffect, useMemo, useState } from "react";
import {
  listCommandesGerant,
  getCommande,
  setStatut,
  deleteCommande,
} from "../services/api_commandes.jsx";
import { initSocket } from "../services/socket";

export default function Commandes() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [statut, setStatutFilter] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [statusModal, setStatusModal] = useState<{ show: boolean; loading: boolean; message: string; error: string }>({ show: false, loading: false, message: "", error: "" });

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const statusStyle = (s: string) => {
    switch ((s || "").toLowerCase()) {
      case "en attente":
        return { border: "border-warning", header: "bg-warning-subtle", text: "text-warning-emphasis" };
      case "valider":
        return { border: "border-primary", header: "bg-primary-subtle", text: "text-primary-emphasis" };
      case "invalider":
        return { border: "border-danger", header: "bg-danger-subtle", text: "text-danger-emphasis" };
      case "en préparation":
        return { border: "border-info", header: "bg-info-subtle", text: "text-info-emphasis" };
      case "prête":
        return { border: "border-secondary", header: "bg-secondary-subtle", text: "text-secondary-emphasis" };
      case "livrée":
        return { border: "border-success", header: "bg-success-subtle", text: "text-success-emphasis" };
      default:
        return { border: "border-light", header: "bg-light", text: "" };
    }
  };

  const fetchCommandes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listCommandesGerant({ page, limit, statut: statut || undefined, type: type || undefined, from: from || undefined, to: to || undefined });
      setItems(res?.items || []);
      setTotal(res?.total || 0);
    } catch (e: any) {
      setError(typeof e === "string" ? e : "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // Realtime updates: rely on global notif event dispatched by services/socket
  useEffect(() => {
    initSocket();
    const onNew = () => { fetchCommandes(); };
    window.addEventListener('notif:new', onNew);
    return () => { window.removeEventListener('notif:new', onNew); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    setPage(1);
    fetchCommandes();
  };

  return (
    <Section title="Commandes" style={{ background: "linear-gradient(180deg, #A00000 0%, #000000 100%)" }}>
      {/* Toolbar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div className="d-flex align-items-center gap-2">
          <select className="form-select form-select-sm" style={{ width: 160 }} value={statut} onChange={(e) => setStatutFilter(e.target.value)}>
            <option value="">Tous statuts</option>
            <option value="en attente">En attente</option>
            <option value="invalidée">Invalidée</option>
            <option value="en préparation">En préparation</option>
            <option value="prête">Prête</option>
            <option value="livrée">Livrée</option>
          </select>
          <select className="form-select form-select-sm" style={{ width: 160 }} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Tous types</option>
            <option value="sur place">Sur place</option>
            <option value="à emporter">À emporter</option>
            <option value="livraison">Livraison</option>
          </select>
          <input type="date" className="form-control form-control-sm" style={{ width: 160 }} value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className="form-control form-control-sm" style={{ width: 160 }} value={to} onChange={(e) => setTo(e.target.value)} />
          <button className="btn btn-sm btn-outline-secondary" onClick={applyFilters}>Filtrer</button>
        </div>
        <div className="d-flex align-items-center gap-2">
          <small className="text-muted">Page {page} / {totalPages} • {total} au total</small>
          <label className="text-muted">Afficher</label>
          <select className="form-select form-select-sm" style={{ width: 90 }} value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-center py-5">Chargement...</div>}
      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="row g-3">
          {items.map((c: any) => {
            const articles = Array.isArray(c.plats) ? c.plats.reduce((n: number, p: any) => n + (Number(p.quantite) || 0), 0) : 0;
            const st = statusStyle(c.statut);
            return (
              <div key={c._id} className="col-sm-6 col-lg-4">
                <div className={`card h-100 shadow border-2 rounded-4 overflow-hidden bg-dark text-white ${st.border}`}>
                  <div className={`card-header d-flex justify-content-between align-items-start ${st.header}`}>
                    <div>
                      <div className={`small ${st.text}`}>#{String(c._id).slice(-6)}</div>
                      <div className={`small ${st.text}`}>{new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                    <span className="badge rounded-pill text-bg-dark border">{c.type}</span>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="small">Client: <span className="text-white-50">{c.clientId ?? "—"}</span></div>
                      <span className="badge rounded-pill text-bg-success">{c.montantTotal} CFA</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="small">Articles: <strong>{articles}</strong></div>
                      <select
                        className="form-select form-select-sm bg-dark text-white border-secondary"
                        style={{ width: 180 }}
                        value={c.statut}
                        onChange={async (e) => {
                          const nv0 = e.target.value;
                          const nv = nv0 === 'invalider' ? 'invalidée' : nv0;
                          if (nv === 'invalidée' && !confirm('Invalider cette commande ?')) return;
                          setStatusModal({ show: true, loading: true, message: "Changement du statut...", error: "" });
                          try {
                            await setStatut(c._id, nv);
                            await fetchCommandes();
                            const okMsg = nv === 'invalidée' ? 'Commande invalidée' : 'Statut mis à jour avec succès';
                            setStatusModal({ show: true, loading: false, message: okMsg, error: "" });
                            setTimeout(() => setStatusModal({ show: false, loading: false, message: "", error: "" }), 900);
                          } catch (err: any) {
                            const msg = typeof err === "string" ? err : (err?.message || "Échec de la mise à jour");
                            setStatusModal({ show: true, loading: false, message: "", error: msg });
                          }
                        }}
                      >
                        <option value="en attente">en attente</option>
                        <option value="invalidée">invalider</option>
                        <option value="en préparation">en préparation</option>
                        <option value="prête">prête</option>
                        <option value="livrée">livrée</option>
                      </select>
                    </div>
                    <div className="mt-2 small text-white-50">
                      {(c.plats || []).slice(0, 3).map((p: any, idx: number) => {
                        const label = (p && p.platId && typeof p.platId === 'object') ? (p.platId.nom || p.platId._id || '') : String(p?.platId || '');
                        return (
                          <div key={idx} className="d-flex justify-content-between border-bottom border-secondary py-1">
                            <span className="text-truncate me-2" title={label}>{label}</span>
                            <span className="badge rounded-pill text-bg-secondary">x{p.quantite}</span>
                          </div>
                        );
                      })}
                      {Array.isArray(c.plats) && c.plats.length > 3 && (
                        <div className="text-end fst-italic">+{c.plats.length - 3} autres…</div>
                      )}
                    </div>
                    <div className="mt-auto d-flex justify-content-between align-items-center pt-3">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                        data-bs-toggle="modal"
                        data-bs-target="#modalCommandeDetails"
                        onClick={() => { (window as any).__commande = c; if ((window as any).__prefillCommande) (window as any).__prefillCommande(c); }}
                      >
                        Détails
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-pill px-3"
                        onClick={async () => {
                          if (!confirm("Supprimer cette commande ?")) return;
                          try {
                            await deleteCommande(c._id);
                            fetchCommandes();
                          } catch (_) {}
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-2">
          <button className="btn btn-sm btn-light" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Précédent</button>
          <span className="text-muted small">Page {page} / {totalPages}</span>
          <button className="btn btn-sm btn-light" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Suivant</button>
        </div>
      )}

      <CommandeDetailsModal onRefresh={fetchCommandes} />

      {statusModal.show && (
        <>
          <div className="modal fade show" style={{ display: "block" }} aria-modal="true" role="dialog">
            <div className="modal-dialog modal-sm modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body text-center">
                  {statusModal.loading && (
                    <div className="d-flex flex-column align-items-center py-2">
                      <div className="spinner-border text-primary mb-2" role="status" />
                      <div>{statusModal.message || "Chargement..."}</div>
                    </div>
                  )}
                  {!statusModal.loading && !statusModal.error && (
                    <div className="text-success fw-semibold py-2">{statusModal.message || "Succès"}</div>
                  )}
                  {!statusModal.loading && statusModal.error && (
                    <>
                      <div className="text-danger fw-semibold py-2">{statusModal.error}</div>
                      <button className="btn btn-sm btn-light" onClick={() => setStatusModal({ show: false, loading: false, message: "", error: "" })}>Fermer</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </Section>
  );
}

function CommandeDetailsModal({ onRefresh }: { onRefresh: () => void }) {
  const [commande, setCommande] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const el = document.getElementById("modalCommandeDetails");
    if (!el) return;
    (window as any).__prefillCommande = (c: any) => {
      if (!c) return;
      setCommande(c);
    };
    const onShown = async () => {
      setError("");
      const c = (window as any).__commande;
      if (!c) return;
      try {
        setLoading(true);
        const full = await getCommande(c._id);
        setCommande(full || c);
      } catch (_) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    el.addEventListener("shown.bs.modal", onShown);
    return () => {
      el.removeEventListener("shown.bs.modal", onShown);
      if ((window as any).__prefillCommande) delete (window as any).__prefillCommande;
    };
  }, []);

  return (
    <div className="modal fade" id="modalCommandeDetails" tabIndex={-1} aria-hidden="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Détails commande</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {loading && <div className="text-center py-3">Chargement...</div>}
            {!loading && error && <div className="alert alert-danger">{error}</div>}
            {!loading && !error && commande && (
              <div className="">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="small text-muted">ID: {String(commande._id).slice(-10)}</div>
                  <div>
                    <span className="badge text-bg-light me-2">{commande.type}</span>
                    <span className="badge text-bg-secondary">{commande.montantTotal} CFA</span>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Plat</th>
                        <th className="text-end">Quantité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(commande.plats || []).map((p: any, idx: number) => {
                        const label = (p && p.platId && typeof p.platId === 'object') ? (p.platId.nom || p.platId._id || '') : String(p?.platId || '');
                        return (
                          <tr key={idx}>
                            <td className="small">{label}</td>
                            <td className="text-end">{p.quantite}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-light" data-bs-dismiss="modal">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
}
