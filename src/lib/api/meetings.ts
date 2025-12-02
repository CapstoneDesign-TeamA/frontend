import { fetcher } from "@/lib/api/fetcher"; // 너희가 공통 fetcher 쓰고 있다 했음.

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// 모임 생성
export async function createMeeting(groupId: number, body: any) {
  return fetcher(`/groups/${groupId}/meetings`, {
    method: "POST",
    body,
  });
}

// 모임 목록 조회
export async function fetchMeetings(groupId: number) {
  return fetcher(`/groups/${groupId}/meetings`, {
    method: "GET",
  });
}

// 참여
export async function participate(groupId: number, meetingId: number) {
  return fetcher(`/groups/${groupId}/meetings/${meetingId}/participate`, {
    method: "POST",
  });
}

// 불참
export async function decline(groupId: number, meetingId: number) {
  return fetcher(`/groups/${groupId}/meetings/${meetingId}/decline`, {
    method: "POST",
  });
}

// 참여자 목록
export async function fetchParticipants(groupId: number, meetingId: number) {
  return fetcher(`/groups/${groupId}/meetings/${meetingId}/participants`, {
    method: "GET",
  });
}