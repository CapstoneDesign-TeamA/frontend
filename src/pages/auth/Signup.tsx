import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nickname: "",
        username: "",
        password: "",
        email: "",
        interests: "", // comma-separated string
        marketingAgreed: false,
    });

    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

    /** 입력값 변경 처리 */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    /** 간단한 프론트 단 validation */
    const validateClient = () => {
        if (!formData.email || !formData.password || !formData.username || !formData.nickname) {
            toast({
                title: "입력 확인",
                description: "모든 필드를 입력해 주세요.",
                variant: "destructive",
            });
            return false;
        }

        if (formData.password.length < 4) {
            toast({
                title: "비밀번호 형식 오류",
                description: "비밀번호는 4자 이상이어야 합니다.",
                variant: "destructive",
            });
            return false;
        }

        if (formData.username.length < 4) {
            toast({
                title: "아이디 형식 오류",
                description: "아이디는 4자 이상이어야 합니다.",
                variant: "destructive",
            });
            return false;
        }

        return true;
    };

    /** 회원가입 요청 */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateClient()) return;

        try {
            setLoading(true);

            const interestsArray = formData.interests
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

            const payload = {
                nickname: formData.nickname,
                username: formData.username,
                password: formData.password,
                email: formData.email,
                interests: interestsArray,
                marketingAgreed: formData.marketingAgreed,
            };

            const res = await fetch(`${API_BASE}/users/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            // JSON 파싱 안전 처리
            let data: any = {};
            try {
                data = await res.json();
            } catch {
                data = { message: "응답을 파싱할 수 없습니다." };
            }

            // Validation 실패 처리
            if (!res.ok) {
                if (data?.details) {
                    const messages = Object.values(data.details).join("\n");
                    throw new Error(messages);
                }
                throw new Error(data?.message || `회원가입에 실패했습니다. (${res.status})`);
            }

            toast({
                title: "회원가입 완료",
                description: data?.message || "이제 로그인할 수 있습니다.",
            });

            navigate("/auth/login");
        } catch (err: any) {
            toast({
                title: "회원가입 실패",
                description: err?.message ?? "서버와의 통신에 실패했습니다.",
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
                    <p className="text-muted-foreground">새 계정을 만드세요</p>
                </div>

                <div className="bg-card rounded-2xl shadow-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="space-y-2">
                            <Label htmlFor="username">아이디</Label>
                            <Input
                                id="username"
                                name="username"
                                placeholder="아이디를 입력하세요"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                            <p className="text-xs text-muted-foreground">4자 이상, 영문/숫자 조합</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nickname">닉네임</Label>
                            <Input
                                id="nickname"
                                name="nickname"
                                placeholder="닉네임을 입력하세요"
                                value={formData.nickname}
                                onChange={handleChange}
                                required
                            />
                            <p className="text-xs text-muted-foreground">한글/영문/숫자, 최대 8자</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">이메일</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">비밀번호</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="4자 이상"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <p className="text-xs text-muted-foreground">4자 이상</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="interests">관심사 (콤마로 구분)</Label>
                            <Input
                                id="interests"
                                name="interests"
                                placeholder="예: 여행, 음악"
                                value={formData.interests}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="marketingAgreed"
                                name="marketingAgreed"
                                type="checkbox"
                                checked={formData.marketingAgreed}
                                onChange={handleChange}
                                className="rounded"
                            />
                            <Label htmlFor="marketingAgreed">마케팅/이벤트 수신에 동의합니다.</Label>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? "회원가입 중..." : "회원가입"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        이미 계정이 있으신가요?{" "}
                        <Link to="/auth/login" className="text-primary hover:underline">
                            로그인
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Signup;