import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AppHeader from "@/components/layout/AppHeader";
import { fetchMyGroups } from "@/lib/api/groups";
import { fetchGroupDetail } from "@/lib/api/groups";
import { useState } from "react";

type AlbumImage = {
    url: string;
    groupId: number;
    groupName: string;
};

/**
 * 앨범 페이지
 * - 참여 중인 모든 그룹의 앨범 이미지를 그룹별로 표시
 */
const Albums = () => {
    const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

    // 내 그룹 목록 가져오기
    const { data: groups = [], isLoading: groupsLoading } = useQuery({
        queryKey: ["groups", "mine"],
        queryFn: fetchMyGroups,
    });

    // 모든 그룹의 상세 정보 가져오기 (앨범 포함)
    const { data: groupDetails, isLoading: detailsLoading } = useQuery({
        queryKey: ["allGroupDetails", groups.map((g) => g.groupId)],
        queryFn: async () => {
            const details = await Promise.all(
                groups.map((group) => fetchGroupDetail(group.groupId))
            );
            return details;
        },
        enabled: groups.length > 0,
    });

    // 모든 앨범 이미지를 하나의 배열로 통합
    const allImages: AlbumImage[] = groupDetails
        ? groupDetails.flatMap((detail) =>
              detail.albums.map((url) => ({
                  url,
                  groupId: detail.groupId,
                  groupName: detail.name,
              }))
          )
        : [];

    // 필터링된 이미지
    const filteredImages = selectedGroup
        ? allImages.filter((img) => img.groupId === selectedGroup)
        : allImages;

    const isLoading = groupsLoading || detailsLoading;

    if (isLoading) {
        return (
            <>
                <AppHeader />
                <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2f7e33] border-t-transparent"></div>
                        <p className="text-lg font-medium text-gray-700">앨범을 불러오는 중입니다...</p>
                        <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30">
            <AppHeader />

            {/* 메인 콘텐츠 */}
            <main className="container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">추억 앨범</h1>
                    <p className="text-gray-600">
                        참여 중인 모든 그룹의 사진을 한눈에 확인하세요
                    </p>
                </div>

                {/* 그룹 필터 */}
                <div className="mb-6 flex flex-wrap gap-3">
                    <Button
                        variant={selectedGroup === null ? "default" : "outline"}
                        className={selectedGroup === null ? "shadow-md" : ""}
                        style={
                            selectedGroup === null
                                ? { backgroundColor: "#2f7e33", color: "white" }
                                : {}
                        }
                        onClick={() => setSelectedGroup(null)}
                    >
                        전체 ({allImages.length})
                    </Button>
                    {groups.map((group) => {
                        const groupImageCount = allImages.filter(
                            (img) => img.groupId === group.groupId
                        ).length;
                        return (
                            <Button
                                key={group.groupId}
                                variant={
                                    selectedGroup === group.groupId ? "default" : "outline"
                                }
                                className={
                                    selectedGroup === group.groupId ? "shadow-md" : ""
                                }
                                style={
                                    selectedGroup === group.groupId
                                        ? { backgroundColor: "#2f7e33", color: "white" }
                                        : {}
                                }
                                onClick={() => setSelectedGroup(group.groupId)}
                            >
                                <Users size={14} className="mr-1.5" />
                                {group.name} ({groupImageCount})
                            </Button>
                        );
                    })}
                </div>

                {/* 이미지 갤러리 */}
                {filteredImages.length > 0 ? (
                    <div className="space-y-8">
                        {/* 그룹별로 분류하여 표시 */}
                        {selectedGroup === null ? (
                            groups.map((group) => {
                                const groupImages = allImages.filter(
                                    (img) => img.groupId === group.groupId
                                );
                                if (groupImages.length === 0) return null;

                                return (
                                    <div key={group.groupId} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold shadow-md"
                                                style={{ backgroundColor: "#2f7e33" }}
                                            >
                                                <Users size={16} />
                                                <span>{group.name}</span>
                                                <span className="text-sm font-normal opacity-90">
                                                    {groupImages.length}장
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {groupImages.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className="aspect-square overflow-hidden rounded-xl border-2 border-gray-100 bg-white hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer group"
                                                >
                                                    <img
                                                        src={img.url}
                                                        alt={`${img.groupName} 앨범`}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="aspect-square overflow-hidden rounded-xl border-2 border-gray-100 bg-white hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer group"
                                    >
                                        <img
                                            src={img.url}
                                            alt={`${img.groupName} 앨범`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    // 앨범이 없을 때
                    <div className="flex flex-col items-center justify-center mt-24 text-center text-gray-400">
                        <ImageIcon size={64} className="mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">등록된 사진이 없습니다</h3>
                        <p className="text-sm mb-4">
                            {selectedGroup
                                ? "이 그룹에 아직 사진이 없습니다."
                                : "참여 중인 그룹에 사진을 추가해보세요."}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Albums;
