const API_KEY = import.meta.env.VITE_API_KEY || "";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://solve.ivy.homes";

export const DEMO_ACCOUNTS = [
  { email: "demo1@ivy.homes", name: "Demo User 1" },
  { email: "demo2@ivy.homes", name: "Demo User 2" },
  { email: "demo3@ivy.homes", name: "Demo User 3" }
];

export const DEFAULT_PASSWORD = import.meta.env.VITE_PASSWORD || "";

// Base request helper with error handling
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json",
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    if (response.status === 401 && options.onUnauthorized) {
      options.onUnauthorized();
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

// Authentication API calls
export async function loginUser(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function refreshAuthToken(refreshToken) {
  return request("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

// Collection APIs
export async function fetchListings(params = {}, token) {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      query.append(key, params[key]);
    }
  });

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return request(`/v1/listings${queryString}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function fetchListingById(listingId, token) {
  return request(`/v1/listing/${listingId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function fetchRentals(params = {}, token) {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      query.append(key, params[key]);
    }
  });

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return request(`/v1/rentals${queryString}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function fetchRentalById(listingId, token) {
  return request(`/v1/rentals/${listingId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function fetchProjects(params = {}, token) {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      query.append(key, params[key]);
    }
  });

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return request(`/v1/projects${queryString}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function fetchProjectById(projectId, token) {
  return request(`/v1/projects/${projectId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// Number & Currency Formatters

/**
 * Format raw Rupee amount into Indian standard representation
 * e.g. 14500000 -> ₹1.45 Cr, 4500000 -> ₹45 L, 42000 -> ₹42,000
 */
export function formatCurrency(amount, compact = false) {
  if (amount === undefined || amount === null || isNaN(amount)) return "N/A";
  
  const num = Number(amount);
  
  if (compact) {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} L`;
    }
    if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  }

  // Standard Indian comma formatting
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Normalizes decimal prices in projects:
 * Values < 10 are in Crores (x 1,00,00,000)
 * Values >= 10 are in Lakhs (x 1,00,000)
 */
export function normalizeProjectPrice(priceMin, priceMax) {
  const parseVal = (val) => {
    if (val === undefined || val === null) return null;
    const num = Number(val);
    if (isNaN(num)) return null;
    if (num < 10) {
      return { raw: Math.round(num * 10000000), text: `${num} Cr` };
    } else {
      return { raw: Math.round(num * 100000), text: `${num} L` };
    }
  };

  const minObj = parseVal(priceMin);
  const maxObj = parseVal(priceMax);

  let formattedRange = "Price on Request";
  if (minObj && maxObj) {
    formattedRange = `₹${minObj.text} - ₹${maxObj.text}`;
  } else if (minObj) {
    formattedRange = `Starting at ₹${minObj.text}`;
  } else if (maxObj) {
    formattedRange = `Up to ₹${maxObj.text}`;
  }

  return {
    rawMin: minObj ? minObj.raw : null,
    rawMax: maxObj ? maxObj.raw : null,
    formatted: formattedRange,
    minText: minObj ? minObj.text : null,
    maxText: maxObj ? maxObj.text : null
  };
}

/**
 * Normalizes property area fields across Listings, Rentals, and Projects
 */
export function normalizeArea(item) {
  if (!item) return { carpet: null, superBuilt: null, display: "N/A" };

  const carpet = item.carpet_area || null;
  const superBuilt = item.super_built_up_area || item.super_builtup_area || null;
  const minArea = item.min_area_sqft || null;
  const maxArea = item.max_area_sqft || null;

  if (minArea && maxArea) {
    return {
      carpet: minArea,
      superBuilt: maxArea,
      display: `${minArea.toLocaleString()} - ${maxArea.toLocaleString()} sq.ft.`
    };
  }

  if (carpet && superBuilt) {
    return {
      carpet,
      superBuilt,
      display: `${carpet.toLocaleString()} sq.ft. (Carpet) / ${superBuilt.toLocaleString()} sq.ft. (Super)`
    };
  }

  if (carpet) {
    return { carpet, superBuilt: null, display: `${carpet.toLocaleString()} sq.ft. (Carpet)` };
  }

  if (superBuilt) {
    return { carpet: null, superBuilt, display: `${superBuilt.toLocaleString()} sq.ft.` };
  }

  return { carpet: null, superBuilt: null, display: "N/A" };
}
