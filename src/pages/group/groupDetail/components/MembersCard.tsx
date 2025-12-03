import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const MembersCard = ({ members }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>멤버 ({members.length})</CardTitle>
            </CardHeader>

            <CardContent>
                {members.length > 0 ? (
                    <ul className="grid gap-3 md:grid-cols-2">
                        {members.map((m, i) => (
                            <li key={i} className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
                                {m}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">등록된 멤버가 없습니다.</p>
                )}
            </CardContent>
        </Card>
    );
};

export default MembersCard;