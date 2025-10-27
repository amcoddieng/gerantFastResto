import axios from "axios";

const API = (import.meta.env.VITE_url_api || "")
  .toString()
  .trim()
  .replace(/^['"]|['"]$/g, "")
  .replace(/\/+$/, "");

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const createCommande = async ({ plats, type }) => {
  try {
    const res = await axios.post(
      `${API}/commandes`,
      { plats, type },
      { headers: authHeader() }
    );
    return res.data;
  } catch (err) {
    console.error("Erreur création commande:", err.response?.data || err.message);
    throw err.response?.data?.error || "Erreur lors de la création de la commande";
  }
};

export const listCommandesGerant = async (params = {}) => {
  try {
    const res = await axios.get(`${API}/commandes`, {
      headers: authHeader(),
      params: {
        page: 1,
        limit: 20,
        ...params,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Erreur liste commandes gérant:", err.response?.data || err.message);
    throw err.response?.data?.error || "Erreur lors de la récupération";
  }
};

export const getCommande = async (id) => {
  try {
    const res = await axios.get(`${API}/commandes/${id}`, { headers: authHeader() });
    return res.data;
  } catch (err) {
    console.error("Erreur récupération commande:", err.response?.data || err.message);
    throw err.response?.data?.error || "Erreur lors de la récupération";
  }
};

export const listCommandesClient = async (clientId, params) => {
  try {
    const res = await axios.get(`${API}/commandes/client/${clientId}`, {
      headers: authHeader(),
      params,
    });
    return res.data;
  } catch (err) {
    console.error("Erreur liste commandes client:", err.response?.data || err.message);
    throw err.response?.data?.error || "Erreur lors de la récupération";
  }
};

export const updateCommande = async (id, payload) => {
  try {
    const res = await axios.put(`${API}/commandes/${id}`, payload, { headers: authHeader() });
    return res.data;
  } catch (err) {
    console.error("Erreur mise à jour commande:", err.response?.data || err.message);
    throw err.response?.data?.error || "Erreur lors de la mise à jour";
  }
};

export const setStatut = async (id, statut) => {
  try {
    const res = await axios.patch(
      `${API}/commandes/${id}/statut`,
      { statut },
      { headers: authHeader() }
    );
    return res.data;
  } catch (err) {
    console.error("Erreur changement statut:", err.response?.data || err.message);
    throw err.response?.data?.error || "Erreur lors du changement de statut";
  }
};

export const setAvis = async (id, { note, commentaire }) => {
  try {
    const res = await axios.patch(
      `${API}/commandes/${id}/avis`,
      { note, commentaire },
      { headers: authHeader() }
    );
    return res.data;
  } catch (err) {
    console.error("Erreur envoi avis:", err.response?.data || err.message);
    throw err.response?.data?.error || "Erreur lors de l'envoi de l'avis";
  }
};

export const deleteCommande = async (id) => {
  try {
    const res = await axios.delete(`${API}/commandes/${id}`, { headers: authHeader() });
    return res.data;
  } catch (err) {
    console.error("Erreur suppression commande:", err.response?.data || err.message);
    throw err.response?.data?.error || "Erreur lors de la suppression";
  }
};
