import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Mail, MessageSquare, Send } from "lucide-react";

const Contact = () => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 폼 제출 시 서버로 전송
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 입력값 검증
        if (!formData.name || !formData.email || !formData.message) {
            toast({
                title: "입력 오류",
                description: "모든 필드를 입력해주세요.",
                variant: "destructive",
            });
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            toast({
                title: "이메일 오류",
                description: "올바른 이메일 주소를 입력해주세요.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("http://localhost:8080/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("서버 오류가 발생했습니다.");

            toast({
                title: "문의가 접수되었습니다",
                description: "빠른 시일 내에 답변드리겠습니다. 감사합니다!",
            });

            setFormData({ name: "", email: "", message: "" });
        } catch (err: any) {
            toast({
                title: "전송 실패",
                description: err.message ?? "서버와의 연결에 실패했습니다.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-b from-primary/5 to-background py-20">
                    <div className="container text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">문의하기</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            궁금한 점이나 제안사항이 있으신가요? 언제든지 연락주세요.
                        </p>
                    </div>
                </section>

                {/* Contact Form Section */}
                <section className="py-20">
                    <div className="container max-w-4xl">
                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Left: Form */}
                            <div className="bg-card rounded-2xl shadow-card p-8">
                                <h2 className="text-2xl font-bold mb-6">메시지 보내기</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">이름</Label>
                                        <Input
                                            id="name"
                                            placeholder="홍길동"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">이메일</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="email@example.com"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, email: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">메시지</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="문의 내용을 입력해주세요."
                                            rows={6}
                                            value={formData.message}
                                            onChange={(e) =>
                                                setFormData({ ...formData, message: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            "전송 중..."
                                        ) : (
                                            <>
                                                <Send size={18} className="mr-2" />
                                                문의 보내기
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </div>

                            {/* Right: Info */}
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold mb-6">연락처 정보</h2>
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <Mail className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-1">이메일</h3>
                                                <a
                                                    href="mailto:contact@once.app"
                                                    className="text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    contact@once.app
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <MessageSquare className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-1">지원</h3>
                                                <p className="text-muted-foreground">
                                                    평일 10:00 - 18:00
                                                    <br />
                                                    (주말 및 공휴일 제외)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-muted/30 rounded-xl p-6">
                                    <h3 className="font-semibold mb-3">자주 묻는 질문</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        문의하기 전에 FAQ를 확인해보세요. 많은 질문에 대한 답변을 찾으실 수 있습니다.
                                    </p>
                                    <Button variant="outline" asChild>
                                        <a href="/#faq">FAQ 보기</a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Contact;