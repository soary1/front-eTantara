/**
 * API Configuration
 * Centralise tous les appels API pour l'application eTantara
 */

// Déterminer la base API selon l'environnement
const API_BASE = (import.meta as any).env?.VITE_API_BASE || "/api";

/**
 * Effectue un appel API générique
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  // Ajouter le token d'authentification s'il existe
  const token = localStorage.getItem("authToken");
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Définir le type de contenu par défaut
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return data as T;
}

/**
 * GET request
 */
export async function apiGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return request<T>(endpoint, { ...options, method: "GET" });
}

/**
 * POST request
 */
export async function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return request<T>(endpoint, { ...options, method: "DELETE" });
}

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register-no-validation",
  LOGOUT: "/auth/logout",

  // Quiz
  QUIZ_GET: "/quiz",
  QUIZ_SUBMIT_ANSWER: "/quiz/reponse",
  QUIZ_SUBMIT_RESULTS: "/quiz/resultats",
  QUIZ_SUBMIT: "/quiz/submit",

  // Contenus
  CONTENUS_LIST: "/contenus",
  CONTENUS_BY_TYPE: (type: string) => `/contenus?type=${type}`,

  // Utilisateur
  USER_POINTS: (username: string) => `/user/points/${username}`,

  // Partage
  SHARE_QUIZ: "/quiz/submit",
  SHARE_TANTARA: "/tantara/submit",
  SHARE_OHABOLANA: "/ohabolana/submit",
};
