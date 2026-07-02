export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const reqHeaders = new Headers(init?.headers);
  if (!isFormData && !reqHeaders.has('Content-Type')) {
    reqHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...init,
    headers: reqHeaders,
  });
  if (!response.ok) {
    const errText = await response.text();
    let errMessage = response.statusText;
    try {
      const errJson = JSON.parse(errText);
      errMessage = errJson.message || errJson.code || errMessage;
    } catch {
      if (errText) errMessage = errText;
    }
    throw new Error(errMessage || `HTTP ${response.status}`);
  }
  const text = await response.text();
  if (!text) return null as unknown as T;
  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}

export async function requestBlob(
  path: string,
  init?: RequestInit,
): Promise<Blob> {
  const reqHeaders = new Headers(init?.headers);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...init,
    headers: reqHeaders,
  });
  
  if (!response.ok) {
    const errText = await response.text();
    let errMessage = response.statusText;
    try {
      const errJson = JSON.parse(errText);
      errMessage = errJson.message || errJson.code || errMessage;
    } catch {
      if (errText) errMessage = errText;
    }
    throw new Error(errMessage || `HTTP ${response.status}`);
  }
  
  return await response.blob();
}
