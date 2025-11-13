import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Image as ImageIcon, Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

/**
 * 앨범 페이지
 * - 그룹별 추억 앨범을 조회하고 업로드 가능
 * - 모든 데이터는 나중에 백엔드 API와 연동 예정
 */
const Albums = () => {
    // 나중에 백엔드에서 앨범 리스트를 불러올 예정
    const { data, isLoading } = useQuery({
        queryKey: ["albums"],
        queryFn: async () => {
            // TODO: 추후 실제 API 호출로 교체
            // const res = await fetch("/albums");
            // if (!res.ok) throw new Error("앨범 데이터를 불러오지 못했습니다.");
            // return res.json();
            return [];
        },
    });

    const albums = data || [];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                앨범 데이터를 불러오는 중입니다...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* 상단 헤더 */}
            <header className="border-b bg-card">
                <div className="container flex h-16 items-center justify-between">
                    <Link to="/" className="text-2xl font-bold text-primary">
                        Once
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            to="/dashboard"
                            className="text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                            대시보드
                        </Link>
                        <Link
                            to="/calendar"
                            className="text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                            캘린더
                        </Link>
                        <Link
                            to="/groups"
                            className="text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                            그룹
                        </Link>
                        <Link
                            to="/albums"
                            className="text-sm font-medium text-primary"
                        >
                            앨범
                        </Link>
                    </nav>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu size={24} />
                    </Button>
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="container py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">추억 앨범</h1>
                        <p className="text-muted-foreground">
                            모임의 소중한 순간들을 기록하세요
                        </p>
                    </div>
                    <Button>
                        <Plus size={18} className="mr-2" />
                        사진 올리기
                    </Button>
                </div>

                {/* 앨범 목록 */}
                {albums.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {albums.map((album: any) => (
                            <div
                                key={album.id}
                                className="bg-card rounded-xl shadow-card overflow-hidden hover:shadow-hover transition-shadow cursor-pointer group"
                            >
                                {/* 앨범 썸네일 */}
                                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    {album.thumbnailUrl ? (
                                        <img
                                            src={album.thumbnailUrl}
                                            alt={album.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <ImageIcon size={48} className="text-muted-foreground/30" />
                                    )}
                                </div>

                                {/* 앨범 정보 */}
                                <div className="p-6">
                                    <h3 className="text-lg font-bold mb-2">
                                        {album.title ?? "제목 없음"}
                                    </h3>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        <p>{album.groupName ?? "소속 그룹 없음"}</p>
                                        <p>{album.photoCount ?? 0}장의 사진</p>
                                        <p className="text-xs">{album.date ?? "날짜 미정"}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // 앨범이 없을 때
                    <div className="flex flex-col items-center justify-center mt-24 text-center text-muted-foreground">
                        <ImageIcon size={48} className="mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">등록된 앨범이 없습니다</h3>
                        <p className="text-sm mb-4">
                            모임의 추억을 사진으로 남겨보세요.
                        </p>
                        <Button>
                            <Plus size={18} className="mr-2" />
                            새 사진 올리기
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Albums;