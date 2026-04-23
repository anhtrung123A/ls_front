import { API_HOSTS } from "../constants/api";
import { apiFetch } from "./apiClient";

const AUTH_STORAGE_KEY = "auth_tokens";

type AuthStorage = {
  accessToken: string;
};

export type Branch = {
  id: number;
  name: string;
  description: string;
  addressLine1: string;
  addressLine2: string | null;
  ward: string;
  district: string;
  city: string;
  postalCode: string;
  country: string;
  imageUrl: string | null;
};

export type BranchPayload = {
  name: string;
  description: string;
  addressLine1: string;
  addressLine2: string | null;
  ward: string;
  district: string;
  city: string;
  postalCode: string;
  country: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type UploadedFileData = {
  id: number;
  objectKey: string;
  url: string;
  fileName: string;
  contentType: string;
  size: number;
  createdAt: string;
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

export async function createBranch(payload: BranchPayload) {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/branches`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse<Branch>(response);
}

export async function getBranches() {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/branches`, {
    method: "GET",
    headers: getAuthHeaders(""),
  });

  return handleResponse<Branch[]>(response);
}

export async function getBranchById(id: number) {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/branches/${id}`, {
    method: "GET",
    headers: getAuthHeaders(""),
  });

  return handleResponse<Branch>(response);
}

export async function updateBranch(id: number, payload: BranchPayload) {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/branches/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse<Branch>(response);
}

export async function deleteBranch(id: number) {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/branches/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(""),
  });

  return handleResponse<boolean>(response);
}

export async function uploadBranchImage(id: number, file: File, isUpdate = false) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/branches/${id}/image`, {
    method: isUpdate ? "PUT" : "POST",
    headers: getAuthHeaders(""),
    body: formData,
  });

  return handleResponse<UploadedFileData>(response);
}

