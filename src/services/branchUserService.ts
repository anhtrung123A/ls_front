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

export type BranchUser = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  dateOfBirth: string;
  branchId: number;
  status: number;
  avatarUrl: string | null;
};

export type BranchUserListResponse = {
  items: BranchUser[];
  totalRecords: number;
  currentPage: number;
  limit: number;
  offset: number;
};

export type CreateBranchUserPayload = {
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  dateOfBirth: string;
  branchId: number;
  roleId: number;
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

export async function createBranchUser(payload: CreateBranchUserPayload) {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/branch-users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse<BranchUser>(response);
}

export async function getBranchUsers(branchId?: number, page = 1, limit = 20) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (branchId) {
    params.set("branchId", String(branchId));
  }

  const response = await apiFetch(
    `${API_HOSTS.v1}/api/v1/branch-users?${params.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(""),
    },
  );

  return handleResponse<BranchUserListResponse>(response);
}

export async function getBranchUserById(id: number) {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/branch-users/${id}`, {
    method: "GET",
    headers: getAuthHeaders(""),
  });

  return handleResponse<BranchUser>(response);
}

export async function updateBranchUserStatus(id: number, status: number) {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/branch-users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  return handleResponse<BranchUser>(response);
}

export async function deleteBranchUser(id: number) {
  const response = await apiFetch(`${API_HOSTS.v1}/api/v1/branch-users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(""),
  });

  return handleResponse<boolean>(response);
}

