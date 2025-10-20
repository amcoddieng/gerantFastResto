
import axios from "axios";

const api_connexion_agent = import.meta.env.VITE_url_api;

    console.log("dieng ",api_connexion_agent)
export const connect = async (email, motDePasse) => {
  try {
    const response = await axios.post(`${api_connexion_agent}/auth/login`, {
      email,
      motDePasse,
    });
    return response.data;
  } catch (err) {
    console.error("Erreur de connexion :", err.response?.data || err.message);
    return err.response?.data?.error || "Erreur de connexion";
  }
};
