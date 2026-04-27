import { API_HOSTS } from "../constants/api";
import { apiFetch } from "./apiClient";

const AUTH_STORAGE_KEY = "auth_tokens";

type AuthStorage = {
  accessToken: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type Lead = {
  id: number;
  firstName: string;
  fullName: string;
  source: number;
  status: number;
  assignedTo: number;
  note: string | null;
  metadata: string | null;
};

export type LeadNote = {
  id: number;
  leadId: number;
  content: string;
  metadata: string | null;
};

export type Paginated<T> = {
  items: T[];
  totalRecords: number;
  currentPage: number;
  limit: number;
  offset: number;
};

export type CreateLeadPayload = {
  firstName: string;
  fullName: string;
  source: number;
  status: number;
  assignedTo: number;
  note?: string;
  metadata?: string;
};

export type UpdateLeadPayload = Partial<CreateLeadPayload>;

export type CreateLeadNotePayload = {
  content: string;
  metadata?: string;
};

function getAccessToken() {
  const local = localStorage.getItem(AUTH_STORAGE_KEY);
  if (local) {
    return (JSON.parse(local) as AuthStorage).accessToken;
  }

  const session = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (session) {
    return (JSON.parse(session) as AuthStorage).accessToken;
  }

  return null;
}

function getAuthHeaders(contentType = "application/json") {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Unauthorized. Please sign in again.");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    ...(contentType ? { "Content-Type": contentType } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Request failed.");
  }
  return payload.data;
}

export async function createLead(payload: CreateLeadPayload) {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/leads`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Lead>(response);
}

export async function getLeads(page = 1, limit = 20) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/leads?${params.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(""),
  });
  return handleResponse<Paginated<Lead>>(response);
}

export async function getLeadById(id: number) {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/leads/${id}`, {
    method: "GET",
    headers: getAuthHeaders(""),
  });
  return handleResponse<Lead>(response);
}

export async function updateLead(id: number, payload: UpdateLeadPayload) {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/leads/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Lead>(response);
}

export async function deleteLead(id: number) {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/leads/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(""),
  });
  return handleResponse<boolean>(response);
}

export async function getAssignedLeadsByUser(userId: number, page = 1, limit = 20) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  const response = await apiFetch(
    `${API_HOSTS.v1}/api/v1/leads/assigned/${userId}?${params.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(""),
    },
  );
  return handleResponse<Paginated<Lead>>(response);
}

export async function createLeadNote(leadId: number, payload: CreateLeadNotePayload) {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/leads/${leadId}/notes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<LeadNote>(response);
}

export async function getLeadNotes(leadId: number, page = 1, limit = 20) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  const response = await apiFetch(
    `${API_HOSTS.v1}/api/v1/leads/${leadId}/notes?${params.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(""),
    },
  );
  return handleResponse<Paginated<LeadNote>>(response);
}

export async function getLeadNoteById(leadId: number, id: number) {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/leads/${leadId}/notes/${id}`, {
    method: "GET",
    headers: getAuthHeaders(""),
  });
  return handleResponse<LeadNote>(response);
}

export async function updateLeadNote(
  leadId: number,
  id: number,
  payload: CreateLeadNotePayload,
) {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/leads/${leadId}/notes/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<LeadNote>(response);
}

export async function deleteLeadNote(leadId: number, id: number) {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/leads/${leadId}/notes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(""),
  });
  return handleResponse<boolean>(response);
}
