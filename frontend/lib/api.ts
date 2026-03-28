import { supabase } from './supabase';

// API Helper for Sustainify Backend
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1";

/**
 * Gets the current Supabase session token for backend authentication.
 * Prevents 'Access Denied' and 'Re-Authenticate System' issues.
 */
export const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

export const apiRequest = async (endpoint: string, method: string = 'GET', body: any = null, token: string | null = null) => {
  const authToken = token || await getAuthToken();
  
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config: any = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.error || 'Request failed');
  }

  return data;
};
