import axios from "axios";

const api_tables = (import.meta.env.VITE_url_api || "")
  .toString()
  .trim()
  .replace(/^['"]|['"]$/g, "")
  .replace(/\/+$/, "");

export const listTables = async ({ page = 1, limit = 20 } = {}) => {
    try {
        const response = await axios.get(`${api_tables}/tables`, {
            params: { page, limit },
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        // console.log(response.data);
        return response.data;
    } catch (err) {
        console.error("Erreur lors de la récupération des tables :", err.response?.data || err.message);
        throw err.response?.data?.error || "Erreur lors de la récupération des tables";
    }
};
// notre api prend un token dans le header

export const createTable = async (table) => {
    try {
        const response = await axios.post(`${api_tables}/tables`, table, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (err) {
        console.error("Erreur lors de la création de la table :", err.response?.data || err.message);
        return err.response?.data?.error || "Erreur lors de la création de la table";
    }
};
// supprimer une table
export const deleteTable = async (id) => {
    try {
        const response = await axios.delete(`${api_tables}/tables/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (err) {
        console.error("Erreur lors de la suppression de la table :", err.response?.data || err.message);
        return err.response?.data?.error || "Erreur lors de la suppression de la table";
    }
};
// supprimer une table

export const updateTable = async (id, table) => {
    try {
        const response = await axios.put(`${api_tables}/tables/${id}`, table, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (err) {
        console.error("Erreur lors de la mise à jour de la table :", err.response?.data || err.message);
        return err.response?.data?.error || "Erreur lors de la mise à jour de la table";
    }
};

// details d'une table
export const getTable = async (id) => {
    try {
        const response = await axios.get(`${api_tables}/tables/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (err) {
        console.error("Erreur lors de la récupération de la table :", err.response?.data || err.message);
        return err.response?.data?.error || "Erreur lors de la récupération de la table";
    }
};
// marquer un table comme disponible = libre ou occupé (patch)
export const markTableAsAvailable = async (id, statut) => {
    try {
        const statutStr = typeof statut === 'string' ? statut : (statut ? 'libre' : 'occupee');
        const response = await axios.patch(
            `${api_tables}/tables/${id}/disponibilite`,
            { statut: statutStr },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
        return response.data;
    } catch (err) {
        console.error("Erreur lors de la mise à jour de la table :", err.response?.data || err.message);
        return err.response?.data?.error || "Erreur lors de la mise à jour de la table";
    }
};


