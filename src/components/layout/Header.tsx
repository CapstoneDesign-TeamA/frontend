import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // 현재 경로와 비교해서 메뉴 활성화 여부 확인
    const isActive = (path: string) => location.pathname === path;


    return (
        // 헤더 전체 영역 (상단 고정)
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                {/* 로고 영역 */}
                <Link to="/" className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary">Once</span>
                </Link>

                {/* 데스크톱용 로그인 / 회원가입 버튼 */}
                <div className="hidden md:flex items-center space-x-3">
                    <Button variant="ghost" asChild>
                        <Link to="/auth/login">로그인</Link>
                    </Button>
                    <Button asChild>
                        <Link to="/auth/signup">회원가입</Link>
                    </Button>
                </div>

                {/* 모바일 메뉴 열기/닫기 버튼 */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* 모바일 네비게이션 메뉴 */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-background">
                    <nav className="container flex flex-col space-y-4 py-4">
                        {/* 모바일용 로그인 / 회원가입 버튼 */}
                        <div className="flex flex-col space-y-2 pt-4 border-t">
                            <Button variant="ghost" asChild>
                                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                                    로그인
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link to="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                                    회원가입
                                </Link>
                            </Button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;