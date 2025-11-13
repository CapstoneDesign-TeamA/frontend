import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const FindPassword = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [isSent, setIsSent] = useState(false);

    // 비밀번호 재설정 요청
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast({
                title: "입력 확인",
                description: "이메일을 입력해 주세요.",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            const res = await fetch("/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || "비밀번호 재설정 요청에 실패했습니다.");
            }

            const data = await res.json();
            toast({
                title: "이메일 발송 완료",
                description: data?.message || "임시 비밀번호가 이메일로 전송되었습니다.",
            });

            setIsSent(true);
        } catch (error: any) {
            toast({
                title: "요청 실패",
                description: error?.message ?? "서버와 통신할 수 없습니다.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <h1 className="text-4xl font-bold text-primary mb-2">Once</h1>
                    </Link>
                    <p className="text-muted-foreground">등록된 이메일로 임시 비밀번호를 받으세요</p>
                </div>

                <div className="bg-card rounded-2xl shadow-card p-8">
                    {!isSent ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email">이메일</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                {loading ? "요청 중..." : "임시 비밀번호 받기"}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <p className="text-lg text-muted-foreground">
                                입력한 이메일로 임시 비밀번호가 발송되었습니다.
                            </p>
                            <Button onClick={() => navigate("/auth/login")} className="w-full" size="lg">
                                로그인하러 가기
                            </Button>
                        </div>
                    )}

                    <div className="mt-6 text-center text-sm">
                        <Link to="/auth/find-id" className="text-primary hover:underline">
                            아이디 찾기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FindPassword;