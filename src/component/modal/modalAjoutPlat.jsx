import React, { useEffect, useRef, useState } from "react";
import { createPlat } from "../../services/api_plats.jsx";
import { listCategories } from "../../services/api_categories.jsx";

export default function ModalAjoutPlat({ onCreated }) {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [quantite, setQuantite] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [categorieId, setCategorieId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const closeBtnRef = useRef(null);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const resetForm = () => {
    setNom("");
    setDescription("");
    setPrix("");
    setQuantite(1);
    setImageFile(null);
    setCategorieId("");
    setError("");
  };

  const fetchCategories = async () => {
    setLoadingCats(true);
    try {
      const res = await listCategories({ page: 1, limit: 100 });
      const items = res?.items || res || [];
      setCategories(items);
      if (!categorieId && items.length > 0) setCategorieId(items[0]._id);
    } catch (_) {
      setCategories([]);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    const el = document.getElementById("modalAjoutPlat");
    if (!el) return;
    const onShow = () => fetchCategories();
    el.addEventListener("show.bs.modal", onShow);
    return () => el.removeEventListener("show.bs.modal", onShow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      let payload = {
        nom: nom.trim(),
        description: description.trim(),
        prix: Number(prix) || 0,
        quantite: Math.max(0, Number(quantite) || 0),
        qte: Math.max(0, Number(quantite) || 0),
      };
      if (categorieId) payload.categorieId = categorieId;
      if (imageFile) {
        try {
          payload.image = await toBase64(imageFile);
        } catch (_) {
          // si conversion échoue, ignorer l'image
        }
      }
      const res = await createPlat(payload);
      if (res && res._id) {
        // succès: fermer modal, reset et notifier parent
        resetForm();
        if (closeBtnRef.current) closeBtnRef.current.click();
        onCreated && onCreated(res);
      } else if (typeof res === "string") {
        setError(res);
      }
    } catch (err) {
      setError("Erreur lors de la création du plat");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal fade" id="modalAjoutPlat" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Ajouter un plat</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" ref={closeBtnRef}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="categorie" className="form-label">Catégorie</label>
                <select
                  id="categorie"
                  className="form-select"
                  value={categorieId}
                  onChange={(e) => setCategorieId(e.target.value)}
                  required
                  disabled={loadingCats}
                >
                  <option value="" disabled>{loadingCats ? "Chargement..." : "Sélectionnez une catégorie"}</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.nom}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="nom" className="form-label">Nom</label>
                <input value={nom} onChange={(e) => setNom(e.target.value)} type="text" className="form-control" id="nom" required />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="form-control" id="description" rows="3" required></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="prix" className="form-label">Prix</label>
                <input value={prix} onChange={(e) => setPrix(e.target.value)} type="number" min="0" className="form-control" id="prix" required />
              </div>
              <div className="mb-3">
                <label htmlFor="quantite" className="form-label">Quantité</label>
                <input value={quantite} onChange={(e) => setQuantite(e.target.value)} type="number" min="0" className="form-control" id="quantite" required />
              </div>
              <div className="mb-3">
                <label htmlFor="image" className="form-label">Image (optionnel)</label>
                <input onChange={(e) => setImageFile(e.target.files?.[0] || null)} type="file" accept="image/*" className="form-control" id="image" />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Ajout en cours..." : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
