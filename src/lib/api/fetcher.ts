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
// 공통 fetcher (FormData 자동 처리 지원)
// --------------------
export async function fetcher(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("access_token");

    const isFormData = options.body instanceof FormData;

    // FormData라면 Content-Type 절대 설정하면 안됨
    const headers: HeadersInit = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
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

    // 204 No Content 또는 빈 응답 처리
    if (response.status === 204 || response.headers.get("content-length") === "0") {
        return null;
    }

    // Content-Type 확인
    const contentType = response.headers.get("content-type");

    // JSON 응답인 경우
    if (contentType && contentType.includes("application/json")) {
        const json = await response.json();
        return toCamel(json);
    }

    // Plain text 응답인 경우
    const text = await response.text();

    // JSON 파싱 시도
    try {
        const json = JSON.parse(text);
        return toCamel(json);
    } catch {
        // JSON이 아니면 텍스트 그대로 반환
        return { message: text };
    }
}