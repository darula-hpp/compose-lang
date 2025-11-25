interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function request<T>(
  method: string,
  path: string,
  data?: any,
  options?: RequestOptions
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  const config: RequestInit = {
    method,
    headers,
    ...options,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, use status text
        errorData = { message: response.statusText };
      }
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API Request Failed (${method} ${path}):`, error);
    throw new Error(error.message || 'An unexpected error occurred.');
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, data: any, options?: RequestOptions) =>
    request<T>('POST', path, data, options),
  put: <T>(path: string, data: any, options?: RequestOptions) =>
    request<T>('PUT', path, data, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
};
