import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Plus as PlusIcon, Users, Menu } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyGroups, createGroup, Group } from "@/lib/api/groups";
import { CreateGroupModal, CreateGroupPayload } from "@/components/groups/CreateGroupModal";
import { useState } from "react";

const Groups = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // 내 그룹 목록 가져오기
    const { data, isLoading, isError, error } = useQuery<Group[]>({
        queryKey: ["groups", "mine"],
        queryFn: fetchMyGroups,
        retry: 1,
    });

    // 그룹 생성 요청
    const createMutation = useMutation({
        mutationFn: (payload: CreateGroupPayload) => createGroup(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groups", "mine"] });
            alert("그룹이 생성되었습니다.");
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : "그룹 생성 중 오류가 발생했습니다.";
            alert(msg);
        },
    });

    const groups = data || [];
    const [openCreate, setOpenCreate] = useState(false);

    const handleCreateSubmit = (payload: CreateGroupPayload) => {
        createMutation.mutate(payload, { onSuccess: () => setOpenCreate(false) });
    };

    // 로딩 중
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                그룹 정보를 불러오는 중입니다...
            </div>
        );
    }

    // 에러 발생
    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center">
                <div>
                    <p>그룹 정보를 가져오는 중 오류가 발생했습니다.</p>
                    <p className="text-muted-foreground text-sm mt-2">{String(error)}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* 헤더 */}
            <header className="border-b bg-card">
                <div className="container flex h-16 items-center justify-between">
                    <Link to="/" className="text-2xl font-bold text-primary">
                        Once
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="/dashboard" className="hover:text-primary">대시보드</Link>
                        <Link to="/calendar" className="hover:text-primary">캘린더</Link>
                        <Link to="/groups" className="text-primary font-semibold hover:text-primary">그룹</Link>
                        <Link to="/albums" className="hover:text-primary">앨범</Link>
                    </nav>

                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu size={24} />
                    </Button>
                </div>
            </header>

            {/* 본문 */}
            <main className="container py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">내 그룹</h1>
                        <p className="text-muted-foreground">
                            참여 중인 그룹: {groups.length}개
                        </p>
                    </div>

                    <Button onClick={() => setOpenCreate(true)} disabled={createMutation.isPending}>
                        <PlusIcon className="mr-2 h-4 w-4" /> 새 그룹 만들기
                    </Button>
                </div>

                {/* 그룹 목록 */}
                {groups.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map((group) => (
                            <div
                                key={group.id}
                                onClick={() => navigate(`/groups/${group.id}`)}
                                className="bg-card rounded-xl shadow-card p-6 hover:shadow-hover transition cursor-pointer"
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
                                        <span className="font-medium text-foreground">
                                            {group.upcomingEvents ?? 0}개
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center mt-20">
                        <Users size={48} className="mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">참여 중인 그룹이 없습니다</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            새로운 그룹을 만들어 친구들과 활동을 시작해보세요.
                        </p>

                        <Button onClick={() => setOpenCreate(true)}>
                            <PlusIcon className="mr-2 h-4 w-4" /> 새 그룹 만들기
                        </Button>
                    </div>
                )}

                {/* 그룹 생성 모달 */}
                <CreateGroupModal
                    open={openCreate}
                    onClose={() => setOpenCreate(false)}
                    onSubmit={handleCreateSubmit}
                    loading={createMutation.isPending}
                />

            </main>
        </div>
    );
};

export default Groups;