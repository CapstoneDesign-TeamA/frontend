import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Users, Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

/**
 * 그룹 페이지
 * - 참여 중인 그룹 목록 표시
 * - 그룹 생성 버튼 제공
 * - 모든 데이터는 추후 API 연동 예정
 */
const Groups = () => {
    // 추후 실제 API 연동 시 React Query로 그룹 목록 가져올 예정
    const { data, isLoading } = useQuery({
        queryKey: ["groups"],
        queryFn: async () => {
            // TODO: 백엔드 연동 시 fetch("/groups") 등으로 변경
            return [];
        },
    });

    const groups = data || [];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                그룹 정보를 불러오는 중입니다...
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
                            className="text-sm font-medium text-primary"
                        >
                            그룹
                        </Link>
                        <Link
                            to="/albums"
                            className="text-sm font-medium text-muted-foreground hover:text-primary"
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
                        <h1 className="text-3xl font-bold mb-2">내 그룹</h1>
                        <p className="text-muted-foreground">
                            참여 중인 그룹: {groups.length}개
                        </p>
                    </div>
                    <Button>
                        <Plus size={18} className="mr-2" />
                        새 그룹 만들기
                    </Button>
                </div>

                {/* 그룹 목록 */}
                {groups.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map((group: any) => (
                            <div
                                key={group.id}
                                className="bg-card rounded-xl shadow-card p-6 hover:shadow-hover transition-shadow cursor-pointer"
                            >
                                <div
                                    className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                                        group.color || "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    <Users size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{group.name}</h3>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>멤버 {group.membersCount ?? 0}명</p>
                                    <p>
                                        예정된 일정{" "}
                                        <span className="font-semibold text-foreground">
                      {group.upcomingEvents ?? 0}개
                    </span>
                                    </p>
                                </div>
                                <div className="mt-4 pt-4 border-t flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        캘린더
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        앨범
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // 그룹이 없을 경우
                    <div className="flex flex-col items-center justify-center mt-24 text-center text-muted-foreground">
                        <Users size={48} className="mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">참여 중인 그룹이 없습니다</h3>
                        <p className="text-sm mb-4">
                            새로운 그룹을 만들어서 친구들과 함께 활동을 시작해보세요.
                        </p>
                        <Button>
                            <Plus size={18} className="mr-2" />
                            새 그룹 만들기
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Groups;