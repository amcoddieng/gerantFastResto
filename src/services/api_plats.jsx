import axios from "axios";

const api_plats = import.meta.env.VITE_url_api;

export const listPlats = async ({ page, limit }) => {
    try {
        const response = await axios.get(`${api_plats}/plats`, {
            params: { page, limit },
        });
        // console.log(response.data);
        return response.data;
    } catch (err) {
        // console.log(err);
        console.error("Erreur lors de la récupération des plats :", err.response?.data || err.message);
        return err.response?.data?.error || "Erreur lors de la récupération des plats";
    }
};
// notre api prend un token dans le header

export const createPlat = async (plat) => {
    try {
        const response = await axios.post(`${api_plats}/plats`, plat, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (err) {
        console.error("Erreur lors de la création du plat :", err.response?.data || err.message);
        return err.response?.data?.error || "Erreur lors de la création du plat";
    }
};

export const getPlat = async (id) => {
    try {
        const response = await axios.get(`${api_plats}/plats/${id}`);
        return response.data;
    } catch (err) {
        console.error("Erreur lors de la récupération du plat :", err.response?.data || err.message);
        return err.response?.data?.error || "Erreur lors de la récupération du plat";
    }
};

export const updatePlat = async (id, payload) => {
    try {
        const token = localStorage.getItem("token");
        const maybeFile = payload?.imageFile || payload?.image;

        // If an image File/Blob is provided, send as multipart/form-data
        if (maybeFile && (maybeFile instanceof File || maybeFile instanceof Blob)) {
            const formData = new FormData();
            Object.entries(payload || {}).forEach(([k, v]) => {
                if (k === 'imageFile') return; // send under 'image'
                if (v === undefined || v === null) return;
                if (v instanceof File || v instanceof Blob) return; // handled below
                formData.append(k, v);
            });
            formData.append('image', maybeFile);

            const response = await axios.put(`${api_plats}/plats/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        }

        // Fallback: JSON payload
        const response = await axios.put(`${api_plats}/plats/${id}`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (err) {
        console.error("Erreur lors de la mise à jour du plat :", err.response?.data || err.message);
        return err.response?.data?.error || "Erreur lors de la mise à jour du plat";
    }
};

export const deletePlat = async (id) => {
    try {
        const response = await axios.delete(`${api_plats}/plats/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (err) {
        console.error("Erreur lors de la suppression du plat :", err.response?.data || err.message);
        return err.response?.data?.error || "Erreur lors de la suppression du plat";
    }
};
