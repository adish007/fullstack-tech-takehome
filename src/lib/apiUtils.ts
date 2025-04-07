/**
 * API utilities for making consistent fetch requests
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Makes a fetch request to the API with standardized error handling
 * @param endpoint API endpoint path (without base URL)
 * @param options Fetch options
 * @returns Promise with typed response data
 */
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Makes a GET request to the API
 * @param endpoint API endpoint path (without base URL)
 * @param options Additional fetch options
 * @returns Promise with typed response data
 */
export async function fetchApiGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'GET',
    ...options
  });
}

/**
 * Makes a POST request to the API
 * @param endpoint API endpoint path (without base URL)
 * @param data Request body data
 * @param options Additional fetch options
 * @returns Promise with typed response data
 */
export async function fetchApiPost<T>(endpoint: string, data: any, options?: RequestInit): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(data),
    ...options
  });
}

/**
 * Makes a PUT request to the API
 * @param endpoint API endpoint path (without base URL)
 * @param data Request body data
 * @param options Additional fetch options
 * @returns Promise with typed response data
 */
export async function fetchApiPut<T>(endpoint: string, data: any, options?: RequestInit): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(data),
    ...options
  });
}

/**
 * Makes a DELETE request to the API
 * @param endpoint API endpoint path (without base URL)
 * @param options Additional fetch options
 * @returns Promise with typed response data
 */
export async function fetchApiDelete<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'DELETE',
    ...options
  });
}

/**
 * Constructs an API URL with optional query parameters
 * @param endpoint API endpoint path
 * @param params Query parameters object
 * @returns Full API URL with query parameters
 */
export function buildApiUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
  }
  
  return url.toString();
}
