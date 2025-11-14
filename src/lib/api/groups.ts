// src/lib/api/groups.ts

export type Group = {
    id: number;
    name: string;
    membersCount?: number;
    upcomingEvents?: number;
    color?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * 공통 fetch 함수 — multipart 지원하도록 개선
 */
async function fetcher(input: RequestInfo, init: RequestInit = {}) {
    const token = localStorage.getItem("accessToken");

    const headers: Record<string, string> = {};

    // multipart일 때 Content-Type 넣으면 절대 안 됨
    const isFormData = init.body instanceof FormData;

    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(input, {
        ...init,
        headers: {
            ...headers,
            ...(init.headers || {}),
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || res.statusText);
    }

    if (res.status === 204) return null;

    return res.json();
}

/**
 * 내 그룹 조회
 * 응답: { data: [...] }
 */
export async function fetchMyGroups(): Promise<Group[]> {
    const res = await fetcher(`${API_BASE}/groups/my`);
    return res.data ?? [];
}

/**
 * 그룹 생성 (multipart/form-data)
 */
export async function createGroup(payload: {
    name: string;
    description?: string;
    file?: File | null;
}) {
    const form = new FormData();
    form.append("name", payload.name);
    form.append("description", payload.description || "");

    if (payload.file) {
        form.append("file", payload.file);
    }

    return fetcher(`${API_BASE}/groups`, {
        method: "POST",
        body: form,
    });
}