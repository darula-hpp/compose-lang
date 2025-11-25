interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    throw new Error(errorData.message || 'An unexpected error occurred.');
  }
  return response.json();
}

export const api = {
  get: async <T>(url: string, options?: RequestOptions): Promise<T> => {
    const response = await fetch(url, {
      method: 'GET',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return handleResponse<T>(response);
  },

  post: async <T>(url: string, data: any, options?: RequestOptions): Promise<T> => {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return handleResponse<T>(response);
  },

  put: async <T>(url: string, data: any, options?: RequestOptions): Promise<T> => {
    const response = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(url: string, options?: RequestOptions): Promise<T> => {
    const response = await fetch(url, {
      method: 'DELETE',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return handleResponse<T>(response);
  },
};
