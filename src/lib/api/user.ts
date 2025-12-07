// src/lib/api/user.ts

import { fetcher } from "./fetcher";

export interface UpdateProfileRequest {
    nickname: string;
    profileImage?: string;
    interests: string[];
}

export interface UpdateProfileResponse {
    userId: number;
    nickname: string;
    email: string;
    profileImage: string | null;
    interests: string[];
    message: string;
}

/**
 * 프로필 업데이트
 * PUT /api/users/profile
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const res = await fetcher("/users/profile", {
        method: "PUT",
        body: JSON.stringify(data),
    });
    return res as UpdateProfileResponse;
}

/**
 * 내 프로필 조회
 * GET /api/users/profile
 */
export async function fetchMyProfile(): Promise<any> {
    const res = await fetcher("/users/profile", {
        method: "GET",
    });
    return res.data || res;
}
