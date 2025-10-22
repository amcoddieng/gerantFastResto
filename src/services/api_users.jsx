import axios from "axios";

const API = import.meta.env.VITE_url_api;

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
