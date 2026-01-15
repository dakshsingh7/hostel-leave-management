// src/api.js

const API_BASE_URL = 'https://hostel-leave-management-production.up.railway.app/api';

// Get auth token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Set auth token in localStorage
function setToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

// Make API request with authentication
async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(response.token);
    return response;
  },

  logout: () => {
    setToken(null);
    localStorage.removeItem('session');
  },

  getCurrentUser: async () => {
    return await apiRequest('/auth/me');
  },
};

// Requests API
export const requestsAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.studentEmail) queryParams.append('studentEmail', filters.studentEmail);
    if (filters.status) queryParams.append('status', filters.status);

    const queryString = queryParams.toString();
    return await apiRequest(`/requests${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return await apiRequest(`/requests/${id}`);
  },

  create: async (fromDate, toDate) => {
    return await apiRequest('/requests', {
      method: 'POST',
      body: JSON.stringify({ fromDate, toDate }),
    });
  },

  update: async (id, updates) => {
    return await apiRequest(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id) => {
    return await apiRequest(`/requests/${id}`, {
      method: 'DELETE',
    });
  },
};
