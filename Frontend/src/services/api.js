import axios from "axios";
import { store } from "../state/store";

// ========================================================================
// THE FIX: The API_BASE_URL was incorrect. It should point to the root of
// your backend server, and the full API path should be used in each call.
// Let's simplify this by setting the baseURL to the versioned root.
// Or even simpler, let's remove it and use relative paths if your frontend
// is served by Django or configured with a proxy.
//
// Let's go with the most robust fix: define the baseURL correctly.
// ========================================================================
const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add the auth token from the Redux store. This part is correct.
api.interceptors.request.use(
  (config) => {
    const token = store.getState().user.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========================================================================
// THE FIX PART 2: We must now use the FULL path from the base URL.
// ========================================================================

// This function had a duplicate return statement. It is fixed.
// AND the path is corrected to include the full API path.
export const fetchProducts = async (params) => {
  // Use the full path from the root
  return api.get("/api/v1/product/product/", { params });
};

// This function is kept, but fetchProducts is preferred for pagination.
// Path is corrected here as well.
export const fetchProduct = async (params) => {
  const response = await api.get("/api/v1/product/product/", { params });
  return response.data;
};

// Path is corrected here.
export const fetchProductById = (productId) => {
  return api.get(`/api/v1/product/product/${productId}/`);
};

// Path is corrected here.
export const fetchCategories = () => {
  return api.get("/api/v1/category/", { params: { page_size: 100 } });
};

// --- The rest of your original functions are kept exactly as they were, but with corrected paths ---

export const getOrCreateCart = async () => {
  // This function's logic seems complex and might not align with your Redux flow.
  // The Redux thunks should be the primary way of interacting with the cart.
  // However, correcting the path for direct calls:
  try {
    const response = await api.get("/api/v1/cart/cart/");
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    } else {
      const createResponse = await api.post("/api/v1/cart/cart/", {});
      return createResponse.data;
    }
  } catch (error) {
    console.error(
      "Error getting or creating cart:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getCartItems = async (cartId) => {
  // Your backend does not seem to have a `/cart/cart-items/` endpoint.
  // The correct endpoint to get cart items is `/api/v1/cart/cart/`.
  // This function might need to be removed in favor of Redux thunks.
  const { data } = await api.get("/api/v1/cart/cart/");
  return data;
};

export const addItemToCart = async (itemData) => {
  const { data } = await api.post("/api/v1/cart/cart/", itemData);
  return data;
};

export const removeItemFromCart = async (cartItemId) => {
  // This URL is incorrect based on your backend.
  // The correct approach is removeItemFromCartAPI in your Redux flow.
  // Correcting it would depend on the exact URL, e.g., `/api/v1/cart/cart/<cartId>/delete/<itemId>/`
};

export const applyDeliveryAPI = ({ orderId, deliveryData }) => {
  return api.post(`/api/v1/product/delivery/create/${orderId}/`, deliveryData);
};

export const extractUniqueAttributes = (products, attributeKey) => {
  const valueSet = new Set();
  products.forEach((product) => {
    if (product.attributes && product.attributes[attributeKey]) {
      valueSet.add(product.attributes[attributeKey]);
    }
  });
  return Array.from(valueSet).sort();
};

export const fetchProductSalesSummary = async () => {
  try {
    const response = await api.get("/api/v1/cart/product-sales-summary/");
    return response.data;
  } catch (error) {
    console.error("Error fetching sales summary:", error);
    throw error;
  }
};

export const fetchRecentOrders = async () => {
  try {
    const response = await api.get("/api/v1/cart/orders/", {
      params: {
        ordering: "-date",
        page_size: 5,
      },
    });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    throw error;
  }
};

export const fetchAllProducts = async () => {
  let allProducts = [];
  let currentPageUrl = "/api/v1/product/product/"; // Use full path

  try {
    while (currentPageUrl) {
      const response = await api.get(currentPageUrl);
      const data = response.data;

      if (data.results) {
        allProducts = allProducts.concat(data.results);
      }
      // axios returns the full URL in `next`, so we need to handle it properly
      currentPageUrl = data.next
        ? new URL(data.next).pathname + new URL(data.next).search
        : null;
    }
    return allProducts;
  } catch (error) {
    console.error("Error fetching all products:", error);
    throw error;
  }
};
