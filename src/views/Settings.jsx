import React from "react";
import Section from "../component/common/Section.jsx";
import { getMe, updateMe, requestPasswordChange, confirmPasswordChange } from "../services/api_users.jsx";
import { connect } from "../services/login_agent.jsx";

export default function Settings() {
  const [me, setMe] = React.useState(null);
  const [form, setForm] = React.useState({ nom: "", telephone: "", adresse: "", photoUrl: "" });
  const [photoFile, setPhotoFile] = React.useState(null);
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
      } catch (_) {}
    })();
    return () => { mounted = false; };
  }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onFile = (e) => setPhotoFile(e.target.files?.[0] || null);

  const onSubmitProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveErr("");
    setSaveOk(false);
    try {
      if (!pwd) throw "Mot de passe requis";
      // Validate current password by logging in (frontend check only)
      const res = await connect(me?.email, pwd);
      if (!res || typeof res !== "object" || !res.token) throw "Mot de passe actuel invalide";

      let payload;
      if (photoFile) {
        const fd = new FormData();
        if (form.nom) fd.append("nom", form.nom);
        if (form.telephone) fd.append("telephone", form.telephone);
        if (typeof form.adresse !== "undefined") fd.append("adresse", form.adresse);
        if (form.photoUrl) fd.append("photo", form.photoUrl);
        fd.append("photo", photoFile);
        payload = fd;
      } else {
        const body = {};
        if (form.nom) body.nom = form.nom;
        if (form.telephone) body.telephone = form.telephone;
        if (typeof form.adresse !== "undefined") body.adresse = form.adresse;
        if (form.photoUrl) body.photo = form.photoUrl;
        payload = body;
      }
      const updated = await updateMe(payload);
      setMe(updated);
      setForm((f) => ({ ...f, photoUrl: updated?.photo || f.photoUrl }));
      setPhotoFile(null);
      setPwd("");
      setSaveOk(true);
      window.dispatchEvent(new Event("profile-updated"));
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

  return (
    <Section title="Paramètres">
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <form className="row g-3" onSubmit={onSubmitProfile}>
            <div className="col-md-6">
              <label className="form-label">Nom</label>
              <input name="nom" className="form-control" value={form.nom} onChange={onChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Téléphone</label>
              <input name="telephone" className="form-control" value={form.telephone} onChange={onChange} />
            </div>
            <div className="col-md-12">
              <label className="form-label">Adresse</label>
              <input name="adresse" className="form-control" value={form.adresse} onChange={onChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Photo (fichier)</label>
              <input type="file" accept="image/*" className="form-control" onChange={onFile} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Photo (URL)</label>
              <input name="photoUrl" className="form-control" value={form.photoUrl} onChange={onChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Mot de passe actuel</label>
              <input type="password" className="form-control" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Requis pour valider" />
            </div>
            <div className="col-12 d-flex align-items-center gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving || !pwd}>{saving ? "Enregistrement..." : "Enregistrer"}</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPwdModal(true)}>Modifier le mot de passe</button>
              {saveOk && <span className="text-success">Mis à jour</span>}
              {saveErr && <span className="text-danger">{saveErr}</span>}
            </div>
          </form>
        </div>

        {showPwdModal && (
          <div className="col-12">
            <div className="position-fixed top-0 start-0 w-100 h-100" style={{ background:"rgba(0,0,0,0.4)" }} onClick={() => setShowPwdModal(false)} />
            <div className="position-fixed top-50 start-50 translate-middle bg-white rounded-4 shadow p-4" style={{ minWidth: 360 }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="m-0">Modifier le mot de passe</h6>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowPwdModal(false)}>Fermer</button>
              </div>
              {pwdStep === "request" ? (
                <form onSubmit={submitPwdRequest} className="d-flex flex-column gap-2">
                  <input type="password" className="form-control" placeholder="Nouveau mot de passe" value={nouveau} onChange={(e) => setNouveau(e.target.value)} />
                  <div className="d-flex align-items-center gap-2">
                    <button type="submit" className="btn btn-primary" disabled={pwdLoading || !nouveau}>{pwdLoading ? "Envoi..." : "Demander le code"}</button>
                    {pwdOk && <span className="text-success">Code envoyé</span>}
                    {pwdError && <span className="text-danger">{pwdError}</span>}
                  </div>
                </form>
              ) : (
                <form onSubmit={submitPwdConfirm} className="d-flex flex-column gap-2">
                  <input className="form-control" placeholder="Code de confirmation" value={token} onChange={(e) => setToken(e.target.value)} />
                  <div className="d-flex align-items-center gap-2">
                    <button type="submit" className="btn btn-success" disabled={pwdLoading || !token}>{pwdLoading ? "Validation..." : "Confirmer"}</button>
                    <button type="button" className="btn btn-outline-secondary" disabled={pwdLoading} onClick={() => { setPwdStep("request"); setToken(""); setPwdOk(false); setPwdError(""); }}>Retour</button>
                    {pwdOk && <span className="text-success">Mot de passe mis à jour</span>}
                    {pwdError && <span className="text-danger">{pwdError}</span>}
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}