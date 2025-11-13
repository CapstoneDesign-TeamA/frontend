import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const FindId = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [foundId, setFoundId] = useState<string | null>(null);

    // 아이디 찾기 요청
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
            const res = await fetch("/users/find-id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || "아이디를 찾을 수 없습니다.");
            }

            const data = await res.json();
            // 서버에서 { username: "사용자아이디" } 형태로 반환된다고 가정
            if (data?.username) {
                setFoundId(data.username);
                toast({
                    title: "아이디 확인",
                    description: `아이디는 "${data.username}" 입니다.`,
                });
            } else {
                toast({
                    title: "아이디 찾기 실패",
                    description: "해당 이메일로 등록된 계정이 없습니다.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "오류 발생",
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
                    <p className="text-muted-foreground">등록된 이메일로 아이디를 찾습니다</p>
                </div>

                <div className="bg-card rounded-2xl shadow-card p-8">
                    {!foundId ? (
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
                                {loading ? "확인 중..." : "아이디 찾기"}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <p className="text-lg">
                                회원님의 아이디는{" "}
                                <span className="font-semibold text-primary">{foundId}</span> 입니다.
                            </p>
                            <Button
                                onClick={() => navigate("/auth/login")}
                                className="w-full"
                                size="lg"
                            >
                                로그인하러 가기
                            </Button>
                        </div>
                    )}

                    <div className="mt-6 text-center text-sm">
                        <Link to="/auth/find-password" className="text-primary hover:underline">
                            비밀번호 찾기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FindId;