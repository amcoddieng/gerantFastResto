import axios from "axios";

const api_categories = (import.meta.env.VITE_url_api || "").trim().replace(/^['"]|['"]$/g, "").replace(/\/+$/, "");

export const listCategories = async ({ page = 1, limit = 20, active, search } = {}) => {
  const params = { page, limit };
  if (typeof active !== "undefined") params.active = active;
  if (search) params.search = search;
  try {
    const res = await axios.get(`${api_categories}/categories`, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement des catégories :", err.response?.data || err.message);
    throw err.response?.data?.error || "Erreur lors du chargement des catégories";
  }
};

export const getCategory = async (id) => {
  try {
    const res = await axios.get(`${api_categories}/categories/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la récupération de la catégorie :", err.response?.data || err.message);
    throw err.response?.data?.error || "Erreur lors de la récupération de la catégorie";
  }
};

export const createCategory = async (payload) => {
  try {
    const res = await axios.post(`${api_categories}/categories`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la création de la catégorie :", err.response?.data || err.message);
    throw err.response?.data?.error || "Erreur lors de la création de la catégorie";
  }
};

export const updateCategory = async (id, payload) => {
  try {
    const res = await axios.put(`${api_categories}/categories/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la catégorie :", err.response?.data || err.message);
    throw err.response?.data?.error || "Erreur lors de la mise à jour de la catégorie";
  }
};

export const toggleCategoryActive = async (id, active) => {
  try {
    const res = await axios.patch(
      `${api_categories}/categories/${id}/active`,
      { active },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Erreur lors de l'activation de la catégorie :", err.response?.data || err.message);
    throw err.response?.data?.error || "Erreur lors de l'activation de la catégorie";
  }
};

export const deleteCategory = async (id) => {
  try {
    const res = await axios.delete(`${api_categories}/categories/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la suppression de la catégorie :", err.response?.data || err.message);
    throw err.response?.data?.error || "Erreur lors de la suppression de la catégorie";
  }
};
