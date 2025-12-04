import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import sproutImg from "@/assets/sprout.png";

const MembersCard = ({ members }) => {
    return (
        <Card className="shadow-lg hover:shadow-xl transition-all border-2 border-gray-100">
            <CardHeader className="pb-3 bg-gradient-to-r from-white to-gray-50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-gray-900">멤버</CardTitle>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-sm font-bold shadow-md"
                         style={{ backgroundColor: '#2f7e33' }}>
                        <Users size={14} />
                        <span>{members.length}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {members.length > 0 ? (
                    <ul className="space-y-2.5">
                        {members.map((m, i) => (
                            <li key={i} className="flex items-center gap-3 rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm hover:border-gray-200 hover:shadow-md transition-all">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm"
                                     style={{ backgroundColor: '#e8f5e9' }}>
                                    <img src={sproutImg} alt="profile" className="w-6 h-6 object-contain" />
                                </div>
                                <span className="font-semibold text-gray-700">{m}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">👥</div>
                        <p className="text-sm">등록된 멤버가 없습니다</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default MembersCard;