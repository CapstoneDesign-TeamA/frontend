import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AppHeader from "@/components/layout/AppHeader";
import { User, Mail, Calendar, Users, Image as ImageIcon, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import { fetchMyGroups, fetchGroupDetail } from "@/lib/api/groups";
import sproutImg from "@/assets/sprout.png";
import {updateProfile, fetchMyProfile} from "@/lib/api/user";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const MyPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // API로 사용자 프로필 정보 가져오기
    const { data: profileData, isLoading: profileLoading } = useQuery({
        queryKey: ["myProfile"],
        queryFn: fetchMyProfile,
    });

    const userName = profileData?.nickname || localStorage.getItem("nickname") || "사용자";
    const userEmail = profileData?.email || localStorage.getItem("user_email") || "email@example.com";
    const userProfileImage = profileData?.profileImage || localStorage.getItem("user_profile_image") || "";
    const userInterests = profileData?.interests || [];

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(userName);
    const [editProfileImage, setEditProfileImage] = useState(userProfileImage);
    const [previewImage, setPreviewImage] = useState(userProfileImage);
    const [interestsStr, setInterestsStr] = useState(userInterests.join(", ") || "여행, 음악, 운동");

    // 프로필 데이터가 로드되면 상태 업데이트
    useEffect(() => {
        console.log("profileData:", profileData); // 디버깅용
        console.log("localStorage nickname:", localStorage.getItem("nickname")); // 디버깅용

        if (profileData) {
            setEditName(profileData.nickname);
            setEditProfileImage(profileData.profileImage || "");
            setPreviewImage(profileData.profileImage || "");
            setInterestsStr(profileData.interests?.join(", ") || "여행, 음악, 운동");
        }
    }, [profileData]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setEditProfileImage(result);
                setPreviewImage(result);
            };
            reader.readAsDataURL(file);
        }
    };


    // 통계 데이터 가져오기
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ["myStats"],
        queryFn: async () => {
            // 1. 참여 중인 그룹 목록
            const groups = await fetchMyGroups();

            // 2. 이번 달 일정 가져오기
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const token = localStorage.getItem("accessToken");

            const calendarRes = await fetch(
                `${API_BASE}/calendar?year=${year}&month=${month}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            const calendarData = calendarRes.ok ? await calendarRes.json() : { schedules: [] };
            const scheduleCount = calendarData.schedules?.length || 0;

            // 3. 모든 그룹의 앨범 이미지 개수
            const groupDetails = await Promise.all(
                groups.map((group) => fetchGroupDetail(group.groupId))
            );

            const totalPhotos = groupDetails.reduce(
                (sum, detail) => sum + (detail.albums?.length || 0),
                0
            );

            return {
                groupCount: groups.length,
                scheduleCount,
                photoCount: totalPhotos,
            };
        },
    });

    const { groupCount = 0, scheduleCount = 0, photoCount = 0 } = statsData || {};

    const handleLogout = () => {
        // 로컬스토리지 클리어
        localStorage.removeItem("access_token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("user_id");
        localStorage.removeItem("nickname");
        localStorage.removeItem("user_email");

        toast({
            title: "로그아웃 완료",
            description: "안전하게 로그아웃되었습니다.",
        });

        // 메인 페이지로 이동
        navigate("/");
    };

    // 프로필 업데이트 mutation
    const updateProfileMutation = useMutation({
        mutationFn: () => {
            // 콤마로 구분된 문자열을 배열로 변환
            const interestsArray = interestsStr
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

            return updateProfile({
                nickname: editName,
                profileImage: editProfileImage,
                interests: interestsArray,
            });
        },
        onSuccess: (data) => {
            // 로컬스토리지 업데이트
            localStorage.setItem("nickname", data.nickname);
            localStorage.setItem("user_nickname", data.nickname);
            if (data.profileImage) {
                localStorage.setItem("user_profile_image", data.profileImage);
            }

            // React Query 캐시 무효화하여 최신 데이터 다시 가져오기
            queryClient.invalidateQueries({ queryKey: ["myProfile"] });
            queryClient.invalidateQueries({ queryKey: ["myStats"] });

            setIsEditing(false);
            toast({
                title: "프로필 수정 완료",
                description: "프로필이 성공적으로 수정되었습니다.",
            });
        },
        onError: (error) => {
            toast({
                title: "프로필 수정 실패",
                description: error instanceof Error ? error.message : "다시 시도해주세요.",
                variant: "destructive",
            });
        },
    });

    const handleSave = () => {
        updateProfileMutation.mutate();
    };

    // 로딩 중일 때
    if (profileLoading || statsLoading) {
        return (
            <>
                <AppHeader />
                <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2f7e33] border-t-transparent"></div>
                        <p className="text-lg font-medium text-gray-700">프로필 정보를 불러오는 중입니다...</p>
                        <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30">
            <AppHeader />

            <main className="container py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 text-gray-900">마이페이지</h1>
                    <p className="text-gray-600">내 정보와 활동을 확인하세요</p>
                </div>

                <div className="space-y-6">
                    {/* 프로필 카드 */}
                    <Card className="shadow-lg hover:shadow-xl transition-all border-2 border-gray-100">
                        <CardHeader className="bg-gradient-to-r from-white to-gray-50">
                            <CardTitle className="text-lg font-bold text-gray-900">프로필 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-6">
                                {/* 프로필 이미지 */}
                                <div className="flex flex-col items-center gap-3">
                                    <div
                                        className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg"
                                        style={{ backgroundColor: '#e8f5e9' }}
                                    >
                                        {(isEditing ? previewImage : userProfileImage) ? (
                                            <img
                                                src={isEditing ? previewImage : userProfileImage}
                                                alt="profile"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = sproutImg;
                                                    e.currentTarget.className = "w-16 h-16 object-contain";
                                                }}
                                            />
                                        ) : (
                                            <img src={sproutImg} alt="profile" className="w-16 h-16 object-contain" />
                                        )}
                                    </div>
                                    {isEditing && (
                                        <div className="flex flex-col items-center gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                id="profile-image-input"
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => document.getElementById('profile-image-input')?.click()}
                                                className="text-xs"
                                            >
                                                프로필 수정
                                            </Button>
                                            <p className="text-xs text-gray-500 text-center max-w-[100px]">
                                                사진을 선택하세요
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* 프로필 정보 */}
                                <div className="flex-1 space-y-4">

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600 block mb-2">이름</label>
                                        {isEditing ? (
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="max-w-xs"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <User size={18} className="text-gray-500" />
                                                <span className="text-lg font-semibold text-gray-900">{userName}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600 block mb-2">이메일</label>
                                        <div className="flex items-center gap-2">
                                            <Mail size={18} className="text-gray-500" />
                                            <span className="text-gray-700">{userEmail}</span>
                                        </div>
                                    </div>

                                    {/* 관심사 필드 */}
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600 block mb-2">관심사</label>
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <Input
                                                    value={interestsStr}
                                                    onChange={(e) => setInterestsStr(e.target.value)}
                                                    placeholder="관심사를 콤마(,)로 구분하여 입력하세요. 예: 여행, 음악, 운동"
                                                    className="max-w-md"
                                                />
                                                <p className="text-xs text-gray-500">
                                                    * 관심사를 콤마(,)로 구분하여 입력해주세요. 최소 1개 이상 입력해야 합니다.
                                                </p>
                                                {interestsStr.split(",").filter(s => s.trim()).length === 0 && (
                                                    <p className="text-xs text-red-500">관심사는 최소 1개 이상 입력해야 합니다</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {interestsStr.split(",").map((interest, idx) => {
                                                    const trimmed = interest.trim();
                                                    if (!trimmed) return null;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="px-3 py-1 rounded-full text-sm"
                                                            style={{ backgroundColor: '#e8f5e9', color: '#2f7e33' }}
                                                        >
                                                            {trimmed}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        {isEditing ? (
                                            <>
                                                <Button
                                                    onClick={handleSave}
                                                    className="text-white shadow-md"
                                                    style={{ backgroundColor: '#2f7e33' }}
                                                    disabled={updateProfileMutation.isPending || interestsStr.split(",").filter(s => s.trim()).length === 0}
                                                >
                                                    {updateProfileMutation.isPending ? "저장 중..." : "저장"}
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setEditName(userName);
                                                        setEditProfileImage(userProfileImage);
                                                        setPreviewImage(userProfileImage);
                                                        setInterestsStr("여행, 음악, 운동");
                                                    }}
                                                    variant="outline"
                                                    disabled={updateProfileMutation.isPending}
                                                >
                                                    취소
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    onClick={() => setIsEditing(true)}
                                                    variant="outline"
                                                >
                                                    프로필 수정
                                                </Button>
                                                <Button
                                                    onClick={handleLogout}
                                                    variant="destructive"
                                                >
                                                    <LogOut size={18} className="mr-2" />
                                                    로그아웃
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 활동 통계 */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <Card className="shadow-lg hover:shadow-xl transition-all border-2 border-gray-100">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                                        style={{ backgroundColor: '#2f7e33' }}
                                    >
                                        <Users size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">참여 그룹</p>
                                        <p className="text-2xl font-bold text-gray-900">{groupCount}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg hover:shadow-xl transition-all border-2 border-gray-100">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                                        style={{ backgroundColor: '#4a9d4e' }}
                                    >
                                        <Calendar size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">예정된 일정</p>
                                        <p className="text-2xl font-bold text-gray-900">{scheduleCount}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg hover:shadow-xl transition-all border-2 border-gray-100">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                                        style={{ backgroundColor: '#5db85f' }}
                                    >
                                        <ImageIcon size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">공유한 사진</p>
                                        <p className="text-2xl font-bold text-gray-900">{photoCount}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyPage;
