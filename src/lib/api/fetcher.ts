// src/lib/api/fetcher.ts

// --------------------
// snake_case → camelCase 변환 함수
// --------------------
export function toCamel(input: unknown): unknown {
    if (Array.isArray(input)) {
        return input.map((v) => toCamel(v));
    }

    if (input !== null && typeof input === "object") {
        const obj = input as Record<string, unknown>;
        return Object.keys(obj).reduce((result, key) => {
            const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
            result[camelKey] = toCamel(obj[key]);
            return result;
        }, {} as Record<string, unknown>);
    }

    return input;
}

// --------------------
// 공통 fetcher
// --------------------
export async function fetcher(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("access_token");

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(import.meta.env.VITE_API_BASE_URL + url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "API Error");
    }

    const json = await response.json();
    return toCamel(json);
}