import Section from "../component/common/Section.jsx";
import { useEffect, useMemo, useState } from "react";
import { listPlats, getPlat, updatePlat, deletePlat } from "../services/api_plats.jsx";
import ModalAjoutPlat from "../component/modal/modalAjoutPlat.jsx";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
} from "../services/api_categories.jsx";


export default function Plats() {
  const [plats, setPlats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [total, setTotal] = useState(0);
  const [cats, setCats] = useState([]);
  const [activeCat, setActiveCat] = useState(null);

  const fetchPlats = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await listPlats({ page, limit });
      // console.log(response);
      setPlats(response?.items || []);
      setTotal(response?.total || 0);
    } catch (err) {
      // console.log(err);   
      setError("Erreur lors de la récupération des plats");
    } finally {
      setLoading(false);
    }
  };

  const fetchCats = async () => {
    try {
      const res = await listCategories({ active: true, limit: 20 });
      setCats(res?.items || []);
    } catch {}
  };

  useEffect(() => {
    fetchPlats();
    fetchCats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Section title="Gestion du Menu">
      <div className="mb-2 text-white-50">Créez et gérez vos plats et catégories</div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <button className={`btn btn-sm ${activeCat===null?'btn-danger':'btn-outline-secondary'}`} onClick={()=>setActiveCat(null)}>Tous</button>
          {(cats || []).map((c)=> (
            <button key={c._id} className={`btn btn-sm ${activeCat===c._id?'btn-danger':'btn-dark'}`} onClick={()=>{ setActiveCat(c._id); }}>{c.nom}</button>
          ))}
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#modalCategories">+ Nouvelle catégorie</button>
          <button className="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#modalAjoutPlat">+ Nouveau plat</button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <small className="text-muted">Page {page} / {totalPages} • {total} au total</small>
        <div className="d-flex align-items-center gap-2">
          <label className="text-muted">Afficher</label>
          <select className="form-select form-select-sm" value={limit} onChange={(e)=>{ setPage(1); setLimit(Number(e.target.value)); }} style={{ width: 90 }}>
            <option value={6}>6</option>
            <option value={9}>9</option>
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
      {!loading && !error && plats.length === 0 && (
        <div className="text-center text-muted py-5">Aucun plat disponible.</div>
      )}

      {!loading && !error && plats.length > 0 && (
        <div className="row">
          {plats
            .filter(p => !activeCat || String(p.categorieId||p.categorie||p.categoryId||'') === String(activeCat))
            .map((plat) => (
            <div key={plat._id} className="col-sm-6 col-lg-4 mb-4">
              <div className="card h-100 shadow border-0 rounded-4 bg-dark text-white overflow-hidden">
                <div className="position-relative" style={{ height: 200 }}>
                  {plat.image ? (
                    <img src={plat.image} alt={plat.nom} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="w-100 h-100 bg-secondary" />
                  )}
                </div>
                <div className="p-3">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div className="fw-semibold text-truncate" title={plat.nom}>{plat.nom}</div>
                    <div className="text-danger fw-bold">{Number(plat.prix||0).toLocaleString()} F CFA</div>
                  </div>
                  <div className="text-white-50 small mb-2 text-truncate" title={plat.description}>{plat.description || ''}</div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className={`badge ${plat.disponible ? 'text-bg-success':'text-bg-secondary'}`}>{plat.disponible ? 'Disponible':'Indisponible'}</span>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#modalPlatDetails" onClick={()=>{ window.__plat = plat; if (window.__prefillPlat) window.__prefillPlat(plat); }} title="Modifier">
                        ✎
                      </button>
                      <button className="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#modalPlatDetails" onClick={()=>{ window.__plat = plat; if (window.__prefillPlat) window.__prefillPlat(plat); }} title="Supprimer">
                        🗑
                      </button>
                    </div>
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

      {/* Modal ajouté une seule fois au bas de la page */}
      <ModalAjoutPlat
        onCreated={(created) => {
          // Si l'élément vient d'être ajouté, on peut rafraîchir la page courante
          // ou insérer optimistement
          // Ici: on recharge pour rester aligné avec le serveur
          fetchPlats();
        }}
      />

      {/* Modal de gestion des catégories */}
      <CategoryManagerModal />

      {/* Modal de détails/modification d'un plat */}
      <PlatDetailsModal onChanged={fetchPlats} />
    </Section>
  );
}

function CategoryManagerModal() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(undefined);
  const [form, setForm] = useState({ _id: null, nom: "", description: "", image: "", active: true });

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listCategories({ page, limit, search: search || undefined, active: activeOnly });
      setItems(res?.items || []);
      setTotal(res?.total || 0);
    } catch (e) {
      setError(typeof e === "string" ? e : "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const el = document.getElementById("modalCategories");
    if (!el) return;
    const onShow = () => fetchCategories();
    el.addEventListener("show.bs.modal", onShow);
    return () => el.removeEventListener("show.bs.modal", onShow);
  }, []);

  useEffect(() => {
    const el = document.getElementById("modalCategories");
    if (el && el.classList.contains("show")) fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, activeOnly]);

  const resetForm = () => setForm({ _id: null, nom: "", description: "", image: "", active: true });

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      if (form._id) {
        await updateCategory(form._id, { nom: form.nom, description: form.description, image: form.image, active: form.active });
      } else {
        await createCategory({ nom: form.nom, description: form.description, image: form.image, active: form.active });
      }
      await fetchCategories();
      resetForm();
    } catch (_) {}
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    try {
      await deleteCategory(id);
      await fetchCategories();
    } catch (e) {
      alert("Suppression impossible (catégorie utilisée ?)");
    }
  };

  const toggleActive = async (cat) => {
    try {
      await toggleCategoryActive(cat._id, !cat.active);
      await fetchCategories();
    } catch (_) {}
  };

  return (
    <div className="modal fade" id="modalCategories" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Catégories</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form className="row g-2 align-items-end" onSubmit={submitForm}>
              <div className="col-sm-4">
                <label className="form-label">Nom</label>
                <input className="form-control" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
              </div>
              <div className="col-sm-5">
                <label className="form-label">Description</label>
                <input className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="col-sm-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary w-100">{form._id ? "Mettre à jour" : "Ajouter"}</button>
                {form._id && (
                  <button type="button" className="btn btn-light" onClick={resetForm}>Annuler</button>
                )}
              </div>
              {/* <div className="col-12">
                <label className="form-label">Image (URL)</label>
                <input className="form-control" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </div> */}
              <div className="col-12 d-flex gap-2 align-items-center">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} id="catActive" />
                  <label className="form-check-label" htmlFor="catActive">Active</label>
                </div>
                <div className="ms-auto d-flex gap-2">
                  <input className="form-control form-control-sm" placeholder="Rechercher..." style={{ width: 180 }} value={search} onChange={(e) => setSearch(e.target.value)} />
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setPage(1); fetchCategories(); }}>Rechercher</button>
                  <select className="form-select form-select-sm" style={{ width: 140 }} value={String(activeOnly)} onChange={(e) => setActiveOnly(e.target.value === 'undefined' ? undefined : e.target.value === 'true')}>
                    <option value="undefined">Toutes</option>
                    <option value="true">Actives</option>
                    <option value="false">Inactives</option>
                  </select>
                </div>
              </div>
            </form>

            {loading && <div className="text-center py-4">Chargement...</div>}
            {!loading && error && <div className="alert alert-danger mt-3">{error}</div>}

            {!loading && !error && (
              <div className="table-responsive mt-3">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Description</th>
                      <th>Statut</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((c) => (
                      <tr key={c._id}>
                        <td>{c.nom}</td>
                        <td className="text-muted small">{c.description}</td>
                        <td>
                          <span className={`badge ${c.active ? 'text-bg-success' : 'text-bg-secondary'}`}>{c.active ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary" onClick={() => setForm({ _id: c._id, nom: c.nom, description: c.description || '', image: c.image || '', active: !!c.active })}>Modifier</button>
                            <button className="btn btn-outline-secondary" onClick={() => toggleActive(c)}>{c.active ? 'Désactiver' : 'Activer'}</button>
                            <button className="btn btn-outline-danger" onClick={() => handleDelete(c._id)}>Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer d-flex justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Page {page} / {totalPages} • {total} au total</span>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-light" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Précédent</button>
              <button className="btn btn-sm btn-light" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Suivant</button>
              <select className="form-select form-select-sm" style={{ width: 90 }} value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlatDetailsModal({ onChanged }) {
  const [form, setForm] = useState({ _id: null, nom: "", description: "", prix: 0, quantite: 0, disponible: true, image: "", imageFile: null, imagePreview: "", categorieId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [cats, setCats] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);

  useEffect(() => {
    const el = document.getElementById("modalPlatDetails");
    if (!el) return;
    // Expose a prefill hook so clicking the button can set immediate data before modal animation
    window.__prefillPlat = (p) => {
      if (!p) return;
      setForm({
        _id: p._id,
        nom: p.nom || "",
        description: p.description || "",
        prix: Number(p.prix) || 0,
        quantite: Number(p.quantite ?? p.qte) || 0,
        disponible: typeof p.disponible === 'boolean' ? p.disponible : true,
        image: p.image || "",
        imageFile: null,
        imagePreview: p.image || "",
      });
    };

    const onShow = async () => {
      setError("");
      const p = window.__plat;
      if (!p) return;
      try {
        const full = await getPlat(p._id);
        const data = full && full._id ? full : p;
        setForm({
          _id: data._id,
          nom: data.nom || "",
          description: data.description || "",
          prix: Number(data.prix) || 0,
          quantite: Number(data.quantite ?? data.qte) || 0,
          disponible: typeof data.disponible === 'boolean' ? data.disponible : true,
          image: data.image || "",
          imageFile: null,
          imagePreview: data.image || "",
          categorieId: String(data.categorieId || data.categorie || data.categoryId || ""),
        });
      } catch (_) {
        setForm({ _id: p._id, nom: p.nom || "", description: p.description || "", prix: Number(p.prix) || 0, quantite: Number(p.quantite ?? p.qte) || 0, disponible: !!p.disponible, image: p.image || "", imageFile: null, imagePreview: p.image || "", categorieId: String(p.categorieId || p.categorie || p.categoryId || "") });
      }
      // fetch categories
      try {
        setLoadingCats(true);
        const res = await listCategories({ active: true, limit: 100 });
        const items = res?.items || res || [];
        setCats(items);
        if (!form.categorieId && items.length > 0) setForm((f)=>({ ...f, categorieId: String(items[0]._id) }));
      } catch {
        setCats([]);
      } finally {
        setLoadingCats(false);
      }
    };
    el.addEventListener("shown.bs.modal", onShow);
    return () => {
      el.removeEventListener("shown.bs.modal", onShow);
      if (window.__prefillPlat) delete window.__prefillPlat;
    };
  }, []);

  const save = async () => {
    if (!form._id) return;
    setSubmitting(true);
    setError("");
    try {
      await updatePlat(form._id, {
        nom: form.nom,
        description: form.description,
        prix: Number(form.prix) || 0,
        quantite: Math.max(0, Number(form.quantite) || 0),
        qte: Math.max(0, Number(form.quantite) || 0),
        disponible: !!form.disponible,
        image: form.image,
        imageFile: form.imageFile || undefined,
        categorieId: form.categorieId || undefined,
      });
      onChanged && onChanged();
      const closeBtn = document.querySelector('#modalPlatDetails [data-bs-dismiss="modal"]');
      if (closeBtn) closeBtn.click();
    } catch (e) {
      setError(typeof e === 'string' ? e : "Erreur lors de la mise à jour du plat");
    } finally {
      setSubmitting(false);
    }
  };

  const adjustQty = (delta) => {
    const next = Math.max(0, Number(form.quantite) + delta);
    setForm((f) => ({ ...f, quantite: next }));
  };

  const removePlat = async () => {
    if (!form._id) return;
    if (!confirm("Supprimer ce plat ?")) return;
    setSubmitting(true);
    setError("");
    try {
      await deletePlat(form._id);
      onChanged && onChanged();
      const closeBtn = document.querySelector('#modalPlatDetails [data-bs-dismiss="modal"]');
      if (closeBtn) closeBtn.click();
    } catch (e) {
      setError(typeof e === 'string' ? e : "Suppression impossible");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal fade" id="modalPlatDetails" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Détails du plat</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-3 text-center">
              {form.imagePreview ? (
                <img src={form.imagePreview} alt="aperçu" style={{ maxHeight: 180, objectFit: "cover" }} className="img-fluid rounded" />
              ) : (
                <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{ height: 180 }}>
                  <span className="text-muted">Pas d'image</span>
                </div>
              )}
              <div className="mt-2 d-flex gap-2 justify-content-center">
                <label className="btn btn-sm btn-outline-secondary mb-0">
                  Changer la photo
                  <input type="file" accept="image/*" hidden onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (!f) return;
                    const url = URL.createObjectURL(f);
                    setForm((prev) => ({ ...prev, imageFile: f, imagePreview: url }));
                  }} />
                </label>
                {form.imagePreview && (
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setForm((prev) => ({ ...prev, imageFile: null, imagePreview: "", image: "" }))}>Retirer</button>
                )}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Nom</label>
              <input className="form-control" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Catégorie</label>
              <select className="form-select" value={form.categorieId} onChange={(e)=> setForm({ ...form, categorieId: e.target.value })} disabled={loadingCats}>
                <option value="" disabled>{loadingCats ? 'Chargement...' : 'Sélectionnez une catégorie'}</option>
                {(cats || []).map((c) => (
                  <option key={c._id} value={c._id}>{c.nom}</option>
                ))}
              </select>
            </div>
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label">Prix</label>
                <input type="number" min="0" className="form-control" value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} />
              </div>
              <div className="col-6">
                <label className="form-label">Quantité</label>
                <div className="input-group">
                  <button className="btn btn-outline-secondary" type="button" onClick={() => adjustQty(-1)}>-</button>
                  <input type="number" min="0" className="form-control text-center" value={form.quantite} onChange={(e) => setForm({ ...form, quantite: e.target.value })} />
                  <button className="btn btn-outline-secondary" type="button" onClick={() => adjustQty(1)}>+</button>
                </div>
              </div>
            </div>
            <div className="form-check mt-3">
              <input className="form-check-input" type="checkbox" id="platDisponible" checked={form.disponible} onChange={(e) => setForm({ ...form, disponible: e.target.checked })} />
              <label className="form-check-label" htmlFor="platDisponible">Disponible</label>
            </div>
          </div>
          <div className="modal-footer d-flex justify-content-between">
            <button type="button" className="btn btn-outline-danger me-auto" onClick={removePlat} disabled={submitting}>Supprimer</button>
            <button type="button" className="btn btn-light" data-bs-dismiss="modal">Fermer</button>
            <button type="button" className="btn btn-primary" onClick={save} disabled={submitting}>{submitting ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

