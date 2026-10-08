// ========================================
// CarMachi — API Client
// ========================================

const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Cars API
export const carsAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI<any>(`/cars${query}`);
  },
  getById: (id: string) => fetchAPI<any>(`/cars/${id}`),
  getBrands: () => fetchAPI<any>('/cars/brands'),
  search: (q: string) => fetchAPI<any>(`/cars/search?q=${encodeURIComponent(q)}`),
};

// Prediction API
export const predictionAPI = {
  predict: (input: any) =>
    fetchAPI<any>('/predict', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  getLocationFactors: (city: string) =>
    fetchAPI<any>(`/predict/factors/${encodeURIComponent(city)}`),
};

// Valuation API
export const valuationAPI = {
  getResaleValue: (input: any) =>
    fetchAPI<any>('/valuation/resale', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  getRunningCost: (input: any) =>
    fetchAPI<any>('/valuation/running-cost', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

// Forum API
export const forumAPI = {
  getPosts: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI<any>(`/forum/posts${query}`);
  },
  createPost: (post: any) =>
    fetchAPI<any>('/forum/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    }),
  replyToPost: (postId: string, reply: any) =>
    fetchAPI<any>(`/forum/posts/${postId}/reply`, {
      method: 'POST',
      body: JSON.stringify(reply),
    }),
  likePost: (postId: string) =>
    fetchAPI<any>(`/forum/posts/${postId}/like`, {
      method: 'POST',
    }),
};

// Live Scraping API
export const liveAPI = {
  getLiveData: (carName: string) => fetchAPI<any>(`/live/scrape?car=${encodeURIComponent(carName)}`),
};

// Auth API (MongoDB)
export const authAPI = {
  register: (data: any) =>
    fetchAPI<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: any) =>
    fetchAPI<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  syncGarage: (garage: string[], token: string) =>
    fetchAPI<any>('/auth/garage/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ garage }),
    }),
};
