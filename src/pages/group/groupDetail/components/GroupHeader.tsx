import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

const GroupHeader = ({ group, onInvite, invitePending }) => {
    return (
        <section className="flex flex-col gap-6 rounded-2xl border-2 border-gray-100 bg-white p-8 shadow-lg hover:shadow-xl transition-all md:flex-row">

            {/* 이미지 영역 */}
            <div className="flex h-64 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 md:w-1/3 border border-gray-200 p-2">
                {group.imageUrl ? (
                    <img
                        src={group.imageUrl}
                        alt="대표 이미지"
                        className="h-full w-full object-contain rounded-lg"
                    />
                ) : (
                    <div className="flex flex-col h-full w-full items-center justify-center text-sm text-gray-400">
                        <div className="text-6xl mb-2">📸</div>
                        <span>대표 이미지가 없습니다</span>
                    </div>
                )}
            </div>

            {/* 텍스트 영역 */}
            <div className="flex flex-1 flex-col justify-center space-y-5">
                <div>
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3"
                         style={{ backgroundColor: '#2f7e33', color: 'white' }}>
                        그룹
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900">
                        {group.name}
                    </h1>
                </div>

                <p className="text-base text-gray-600 leading-relaxed">
                    {group.description || "등록된 설명이 없습니다."}
                </p>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold shadow-lg hover:shadow-xl transition-shadow"
                         style={{ backgroundColor: '#2f7e33' }}>
                        <Users size={18} />
                        <span className="text-xl">{group.members.length}</span>
                        <span className="text-sm font-normal opacity-90">명</span>
                    </div>

                    <Button
                        className="text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        style={{ backgroundColor: '#2f7e33' }}
                        size="lg"
                        onClick={onInvite}
                        disabled={invitePending}
                    >
                        {invitePending ? "생성 중..." : "🔗 초대하기"}
                    </Button>
                </div>
            </div>

        </section>
    );
};

export default GroupHeader;