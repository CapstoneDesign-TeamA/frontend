import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import GroupCalendar from "../../GroupCalendar";

const CalendarCard = ({ groupId }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>캘린더</CardTitle>
                <p className="text-sm text-muted-foreground">모임 날짜를 확인하세요</p>
            </CardHeader>

            <CardContent>
                <GroupCalendar groupId={groupId} onDateSelect={() => {}} />
            </CardContent>
        </Card>
    );
};

export default CalendarCard;