// Determine API base URL based on environment and current hostname
function getApiBaseUrl() {
  // If explicitly set via env variable, use that
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, check if we're on localhost or network
  if (import.meta.env.DEV) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // If on localhost, use proxy (works for local dev)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api';
    }
    
    // If on network IP (e.g., 192.168.x.x), connect directly to backend on same IP
    // Backend port is 5001
    if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return `${protocol}//${hostname}:5001/api`;
    }
  }
  
  // Production fallback - try to use same hostname as frontend
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // If production is on network IP, use that for backend
  if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return `${protocol}//${hostname}:5001/api`;
  }
  
  // Default fallback
  return 'http://localhost:5001/api';
}

const API_BASE_URL = getApiBaseUrl();

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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
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

