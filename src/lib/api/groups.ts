export type Group = {
    id: number;
    name: string;
    membersCount?: number;
    upcomingEvents?: number;
    color?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetcher(input: RequestInfo, init: RequestInit = {}) {
    const token = localStorage.getItem("accessToken");

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(input, {
        ...init,
        headers,
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || res.statusText);
    }

    return res.json();
}

export function fetchMyGroups(): Promise<Group[]> {
    return fetcher(`${API_BASE}/groups/my`);
}

export async function createGroup(payload: { name: string; color?: string; description?: string; imageUrl?: string }) {
    return fetcher(`${API_BASE}/groups`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}