import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { fetchInviteInfo, acceptInvite, InviteInfoResponse } from "@/lib/api/groups";
import sproutImg from "@/assets/sprout.png";

const AcceptInvite = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const token = searchParams.get("token");

    const [groupInfo, setGroupInfo] = useState<InviteInfoResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // 초대 정보 조회
    useEffect(() => {
        if (!token) {
            setError("유효하지 않은 초대 링크입니다.");
            setLoading(false);
            return;
        }

        const fetchInfo = async () => {
            try {
                const data = await fetchInviteInfo(token);
                setGroupInfo(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "초대 정보를 가져올 수 없습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchInfo();
    }, [token]);

    // 초대 수락 mutation
    const acceptMutation = useMutation({
        mutationFn: () => {
            if (!token) throw new Error("토큰이 없습니다.");
            return acceptInvite(token);
        },
        onSuccess: (data) => {
            toast({
                title: "그룹 가입 완료",
                description: `${groupInfo?.name} 그룹에 가입되었습니다.`,
            });
            // 초대받은 그룹 상세 페이지로 이동
            if (groupInfo?.groupId) {
                navigate(`/groups/${groupInfo.groupId}`);
            } else {
                navigate(`/groups`);
            }
        },
        onError: (error) => {
            toast({
                title: "초대 수락 실패",
                description: error instanceof Error ? error.message : "다시 시도해주세요.",
                variant: "destructive",
            });
        },
    });

    const handleAccept = () => {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            toast({
                title: "로그인 필요",
                description: "초대를 수락하려면 로그인해주세요.",
                variant: "destructive",
            });
            navigate(`/auth/login?redirect=/invite?token=${token}`);
            return;
        }

        acceptMutation.mutate();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2f7e33] border-t-transparent"></div>
                    <p className="text-lg font-medium text-gray-700">초대 정보를 확인하는 중입니다...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 flex items-center justify-center p-4">
                <Card className="max-w-md w-full shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-white to-gray-50">
                        <CardTitle className="text-red-600">초대 링크 오류</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button
                            onClick={() => navigate("/groups")}
                            className="w-full text-white"
                            style={{ backgroundColor: '#2f7e33' }}
                        >
                            그룹 목록으로 이동
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!groupInfo) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 flex items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-lg">
                <CardHeader className="bg-gradient-to-r from-white to-gray-50">
                    <CardTitle className="text-2xl">그룹 초대</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {/* 그룹 이미지 */}
                    <div className="flex justify-center">
                        <div
                            className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden shadow-lg"
                            style={{ backgroundColor: '#e8f5e9' }}
                        >
                            {groupInfo.imageUrl ? (
                                <img
                                    src={groupInfo.imageUrl}
                                    alt={groupInfo.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = sproutImg;
                                        e.currentTarget.className = "w-20 h-20 object-contain";
                                    }}
                                />
                            ) : (
                                <img src={sproutImg} alt="group" className="w-20 h-20 object-contain" />
                            )}
                        </div>
                    </div>

                    {/* 그룹 정보 */}
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">{groupInfo.name}</h2>
                        <p className="text-gray-600">{groupInfo.description}</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            이 그룹에 초대되었습니다. 초대를 수락하면 그룹의 일원이 됩니다.
                        </p>
                    </div>

                    {/* 버튼 */}
                    <div className="space-y-2">
                        <Button
                            onClick={handleAccept}
                            disabled={acceptMutation.isPending}
                            className="w-full text-white shadow-md"
                            style={{ backgroundColor: '#2f7e33' }}
                        >
                            {acceptMutation.isPending ? "처리 중..." : "초대 수락"}
                        </Button>

                        <Button
                            onClick={() => navigate("/groups")}
                            variant="outline"
                            className="w-full"
                            disabled={acceptMutation.isPending}
                        >
                            취소
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AcceptInvite;

