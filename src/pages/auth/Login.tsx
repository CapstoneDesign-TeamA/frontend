import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.ts";

const Login = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // 환경변수 기반 백엔드 주소 + 기본값
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast({
                title: "입력 확인",
                description: "이메일과 비밀번호를 모두 입력해 주세요.",
                variant: "destructive",
            });
            return;
        }

        // 실제 백엔드 연동
        const mockMode = false;

        if (mockMode) {
            setLoading(true);
            await new Promise((r) => setTimeout(r, 700));

            toast({
                title: "로그인 성공 (로컬 테스트)",
                description: "더미 계정으로 로그인되었습니다.",
            });

            navigate("/dashboard");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            type LoginResponse = {
                access_token?: string;
                refresh_token?: string;
                message?: string;
            };

            const data: LoginResponse = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || "로그인에 실패했습니다.");
            }

            const accessToken = data.access_token;
            const refreshToken = data.refresh_token;

            // JWT 저장 (키 여러 개로 저장해두면 나중에 바꿔도 안전)
            if (accessToken) {
                localStorage.setItem("access_token", accessToken);
                localStorage.setItem("accessToken", accessToken);
            }
            if (refreshToken) {
                localStorage.setItem("refresh_token", refreshToken);
                localStorage.setItem("refreshToken", refreshToken);
            }

            toast({
                title: "로그인 성공",
                description: "환영합니다.",
            });

            // 라우팅 경로는 프로젝트 라우터에 맞게
            navigate("/dashboard");
        } catch (err: unknown) {
            console.error("로그인 실패:", err);

            const message =
                err instanceof Error
                    ? err.message
                    : "서버와 통신할 수 없습니다.";

            toast({
                title: "로그인 실패",
                description: message,
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
                    <p className="text-muted-foreground">계정에 로그인하세요</p>
                </div>

                <div className="bg-card rounded-2xl shadow-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">이메일</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">비밀번호</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        password: e.target.value,
                                    }))
                                }
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? "로그인 중..." : "로그인"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm space-y-2">
                        <div>
                            <Link
                                to="/auth/find-password"
                                className="text-primary hover:underline"
                            >
                                비밀번호를 잊으셨나요?
                            </Link>
                        </div>
                        <div>
                            계정이 없으신가요?{" "}
                            <Link
                                to="/auth/signup"
                                className="text-primary hover:underline"
                            >
                                회원가입
                            </Link>
                        </div>
                        <div>
                            아이디를 찾고 싶다면{" "}
                            <Link to="/auth/find-id" className="text-primary hover:underline">
                                아이디 찾기
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;