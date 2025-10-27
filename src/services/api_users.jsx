import axios from "axios";

const API = (import.meta.env.VITE_url_api || "")
  .toString()
  .trim()
  .replace(/^['"]|['"]$/g, "")
  .replace(/\/+$/, "");

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getMe = async () => {
  try {
    const res = await axios.get(`${API}/auth/me`, { headers: authHeader() });
    return res.data;
  } catch (err) {
    console.error("Erreur /me:", err.response?.data || err.message);
    if (err?.response?.status === 401) throw "Unauthorized";
    throw err.response?.data?.error || "Erreur lors de la récupération du profil";
  }
};

export const updateMe = async (payload) => {
  try {
    const isForm = typeof FormData !== "undefined" && payload instanceof FormData;
    const headers = {
      ...authHeader(),
      ...(isForm ? {} : { "Content-Type": "application/json" }),
    };
    const res = await axios.patch(`${API}/auth/me`, payload, { headers });
    return res.data;
  } catch (err) {
    console.error("Erreur update /me:", err.response?.data || err.message);
    if (err?.response?.status === 401) throw "Unauthorized";
    throw err.response?.data?.error || "Erreur lors de la mise à jour du profil";
  }
};

export const requestPasswordChange = async (nouveauMotDePasse) => {
  try {
    const res = await axios.post(
      `${API}/auth/me/password/request`,
      { nouveauMotDePasse },
      { headers: { ...authHeader(), "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err) {
    console.error("Erreur request password:", err.response?.data || err.message);
    if (err?.response?.status === 401) throw "Unauthorized";
    throw err.response?.data?.error || "Erreur lors de la demande de changement de mot de passe";
  }
};

export const confirmPasswordChange = async (token) => {
  try {
    const res = await axios.post(
      `${API}/auth/me/password/confirm`,
      { token },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err) {
    console.error("Erreur confirm password:", err.response?.data || err.message);
    throw err.response?.data?.error || "Erreur lors de la confirmation du changement de mot de passe";
  }
};
