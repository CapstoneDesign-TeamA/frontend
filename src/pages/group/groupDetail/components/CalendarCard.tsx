import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import GroupCalendar from "../../GroupCalendar";
import { CalendarDays } from "lucide-react";

const CalendarCard = ({ groupId }) => {
    return (
        <Card className="shadow-lg hover:shadow-xl transition-all border-2 border-gray-100">
            <CardHeader className="pb-3 bg-gradient-to-r from-white to-gray-50">
                <div className="flex items-center gap-2">
                    <CalendarDays size={20} style={{ color: '#2f7e33' }} />
                    <CardTitle className="text-lg font-bold text-gray-900">캘린더</CardTitle>
                </div>
                <p className="text-sm text-gray-500 mt-1">모임 날짜를 확인하세요</p>
            </CardHeader>

            <CardContent>
                <GroupCalendar groupId={groupId} onDateSelect={() => {}} />
            </CardContent>
        </Card>
    );
};

export default CalendarCard;