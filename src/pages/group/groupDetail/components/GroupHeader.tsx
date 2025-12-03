import { Button } from "@/components/ui/button";

const GroupHeader = ({ group }) => {
    return (
        <section className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm md:flex-row">
            <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-lg bg-muted md:w-1/3">
                {group.imageUrl ? (
                    <img src={group.imageUrl} alt="대표 이미지" className="h-full w-full object-contain" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                        대표 이미지가 없습니다.
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col justify-center space-y-4">
                <div>
                    <p className="text-sm text-muted-foreground">그룹명</p>
                    <h1 className="text-3xl font-semibold">{group.name}</h1>
                </div>

                <p className="text-base text-muted-foreground">
                    {group.description || "등록된 설명이 없습니다."}
                </p>

                <div className="flex items-center gap-4">
                    <div className="text-sm font-semibold text-primary">
                        {group.members.length}명 참여중
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GroupHeader;