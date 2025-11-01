import React from "react";
import Section from "../component/common/Section.jsx";
import { getMe, updateMe, requestPasswordChange, confirmPasswordChange } from "../services/api_users.jsx";
import { connect } from "../services/login_agent.jsx";

export default function Settings() {
  const [me, setMe] = React.useState(null);
  const [form, setForm] = React.useState({ nom: "", telephone: "", adresse: "", photoUrl: "" });
  const [photoFile, setPhotoFile] = React.useState(null);
  const [photoPreview, setPhotoPreview] = React.useState("");
  const [pwd, setPwd] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saveErr, setSaveErr] = React.useState("");
  const [saveOk, setSaveOk] = React.useState(false);

  const [showPwdModal, setShowPwdModal] = React.useState(false);
  const [pwdStep, setPwdStep] = React.useState("request");
  const [nouveau, setNouveau] = React.useState("");
  const [token, setToken] = React.useState("");
  const [pwdLoading, setPwdLoading] = React.useState(false);
  const [pwdError, setPwdError] = React.useState("");
  const [pwdOk, setPwdOk] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getMe();
        if (!mounted) return;
        setMe(data);
        setForm({
          nom: data?.nom || "",
          telephone: data?.telephone || "",
          adresse: data?.adresse || "",
          photoUrl: data?.photo || "",
        });
        setPhotoPreview(data?.photo || "");
      } catch (_) {}
    })();
    return () => { mounted = false; };
  }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onFile = (e) => {
    const f = e.target.files?.[0] || null;
    setPhotoFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPhotoPreview(url);
    }
  };

  const onSubmitProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveErr("");
    setSaveOk(false);
    try {
      const normalizeTel = (t) => (t || "").trim().replace(/[^\d+]/g, "").replace(/(?!^)+/g, "");
      let payload;
      if (photoFile) {
        const fd = new FormData();
        if (form.nom) fd.append("nom", form.nom);
        if (form.telephone) fd.append("telephone", normalizeTel(form.telephone));
        if (typeof form.adresse !== "undefined") fd.append("adresse", form.adresse);
        // N'ENVOIE PAS de champ 'photo' string quand on envoie un fichier
        fd.append("photo", photoFile);
        payload = fd;
      } else {
        const body = {};
        if (form.nom) body.nom = form.nom;
        if (form.telephone) body.telephone = normalizeTel(form.telephone);
        if (typeof form.adresse !== "undefined") body.adresse = form.adresse;
        if (typeof form.photoUrl !== "undefined") body.photo = form.photoUrl || ""; // URL data/http ou vide pour retirer
        payload = body;
      }
      const updated = await updateMe(payload);
      setMe(updated);
      setForm((f) => ({ ...f, photoUrl: updated?.photo || f.photoUrl }));
      setPhotoFile(null);
      setPhotoPreview(updated?.photo || "");
      setPwd("");
      setSaveOk(true);
      window.dispatchEvent(new Event("profile:updated"));
    } catch (err) {
      setSaveErr(String(err || "Erreur"));
    } finally {
      setSaving(false);
    }
  };

  const submitPwdRequest = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdError("");
    setPwdOk(false);
    try {
      await requestPasswordChange(nouveau);
      setPwdOk(true);
      setPwdStep("confirm");
    } catch (err) {
      setPwdError(String(err || "Erreur"));
    } finally {
      setPwdLoading(false);
    }
  };

  const submitPwdConfirm = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdError("");
    setPwdOk(false);
    try {
      await confirmPasswordChange(token);
      setPwdOk(true);
      setNouveau("");
      setToken("");
      setPwdStep("request");
      setShowPwdModal(false);
    } catch (err) {
      setPwdError(String(err || "Erreur"));
    } finally {
      setPwdLoading(false);
    }
  };

  // derive API root for avatar preview persisted path
  const raw = import.meta.env?.VITE_url_api || 'http://localhost:4000/api/v1';
  const apiRoot = (raw.endsWith('/api/v1') ? raw.slice(0, -7) : raw.replace(/\/$/, ''));
  const currentAvatar = photoPreview || (form.photoUrl ? `${apiRoot}${form.photoUrl}` : 'https://via.placeholder.com/160x160.png?text=%20');

  return (
    <Section title="Paramètres">
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <form className="row g-3" onSubmit={onSubmitProfile}>
            <div className="col-md-6">
              <label className="form-label text-white">Nom</label>
              <input name="nom" className="form-control bg-dark text-white border-0" value={form.nom} onChange={onChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label text-white">Téléphone</label>
              <input name="telephone" className="form-control bg-dark text-white border-0" value={form.telephone} onChange={onChange} pattern="^[0-9 +()-]{6,}$" />
            </div>
            <div className="col-md-12">
              <label className="form-label text-white">Adresse</label>
              <input name="adresse" className="form-control bg-dark text-white border-0" value={form.adresse} onChange={onChange} />
            </div>
            <div className="col-md-12">
              <label className="form-label text-white">Photo (fichier)</label>
              <div className="d-flex align-items-center gap-3">
                <img src={currentAvatar} alt="aperçu" width={80} height={80} className="rounded-circle border" />
                <div className="d-flex gap-2">
                  <label className="btn btn-sm btn-outline-secondary mb-0">
                    Changer
                    <input type="file" accept="image/*" hidden onChange={onFile} />
                  </label>
                  {photoPreview && (
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => { setPhotoFile(null); setPhotoPreview(""); }}>
                      Retirer
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 d-flex align-items-center gap-2">
              <button type="submit" className="btn btn-danger" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</button>
              {saveOk && <span className="text-success">Mis à jour</span>}
              {saveErr && <span className="text-danger">{saveErr}</span>}
            </div>
          </form>
        </div>

        <div className="col-12 col-lg-5">
          <div className="p-3 rounded-3 border bg-dark">
            <div className="fw-semibold mb-2">Aperçu du profil</div>
            <div className="d-flex align-items-center gap-3">
              <img src={currentAvatar} alt="avatar" width={120} height={120} className="rounded-circle border" />
              <div>
                <div className="small text-white-50">Nom</div>
                <div className="fw-semibold">{form.nom || me?.nom || '—'}</div>
                <div className="small text-white-50 mt-2">Téléphone</div>
                <div>{form.telephone || me?.telephone || '—'}</div>
                <div className="small text-white-50 mt-2">Adresse</div>
                <div className="text-truncate" style={{ maxWidth: 260 }}>{form.adresse || me?.adresse || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}