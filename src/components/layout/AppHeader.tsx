import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const AppHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // 현재 경로와 비교해서 메뉴 활성화 여부 확인
    const isActive = (path: string) => location.pathname.startsWith(path);

    const handleLogout = () => {
        // 로컬스토리지 클리어
        localStorage.removeItem("access_token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("user_id");
        localStorage.removeItem("nickname");
        localStorage.removeItem("user_email");

        toast({
            title: "로그아웃 완료",
            description: "안전하게 로그아웃되었습니다.",
        });

        setMobileMenuOpen(false);
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
            <div className="container flex h-16 items-center justify-between">
                {/* 로고 영역 */}
                <Link to="/dashboard" className="flex items-center space-x-2">
                    <span className="text-2xl font-bold" style={{ color: '#2f7e33' }}>Once</span>
                </Link>

                {/* 데스크톱 네비게이션 */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        to="/dashboard"
                        className={`text-sm font-medium transition-colors ${
                            isActive('/dashboard') 
                                ? 'font-bold' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        style={isActive('/dashboard') ? { color: '#2f7e33' } : {}}
                    >
                        대시보드
                    </Link>
                    <Link
                        to="/calendar"
                        className={`text-sm font-medium transition-colors ${
                            isActive('/calendar') 
                                ? 'font-bold' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        style={isActive('/calendar') ? { color: '#2f7e33' } : {}}
                    >
                        캘린더
                    </Link>
                    <Link
                        to="/groups"
                        className={`text-sm font-medium transition-colors ${
                            isActive('/groups') 
                                ? 'font-bold' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        style={isActive('/groups') ? { color: '#2f7e33' } : {}}
                    >
                        그룹
                    </Link>
                    <Link
                        to="/albums"
                        className={`text-sm font-medium transition-colors ${
                            isActive('/albums') 
                                ? 'font-bold' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        style={isActive('/albums') ? { color: '#2f7e33' } : {}}
                    >
                        앨범
                    </Link>

                    <div className="h-5 w-px bg-gray-300 mx-2" />

                    <Link
                        to="/mypage"
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                            isActive('/mypage') 
                                ? 'font-bold' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        style={isActive('/mypage') ? { color: '#2f7e33' } : {}}
                    >
                        <User size={16} />
                        마이페이지
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={16} />
                        로그아웃
                    </button>
                </nav>

                {/* 모바일 메뉴 토글 버튼 */}
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
                <div className="md:hidden border-t bg-white">
                    <nav className="container flex flex-col space-y-2 py-4">
                        <Link
                            to="/dashboard"
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isActive('/dashboard') 
                                    ? 'font-bold' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            style={isActive('/dashboard') ? { color: '#2f7e33', backgroundColor: '#e8f5e9' } : {}}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            대시보드
                        </Link>
                        <Link
                            to="/calendar"
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isActive('/calendar') 
                                    ? 'font-bold' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            style={isActive('/calendar') ? { color: '#2f7e33', backgroundColor: '#e8f5e9' } : {}}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            캘린더
                        </Link>
                        <Link
                            to="/groups"
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isActive('/groups') 
                                    ? 'font-bold' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            style={isActive('/groups') ? { color: '#2f7e33', backgroundColor: '#e8f5e9' } : {}}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            그룹
                        </Link>
                        <Link
                            to="/albums"
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isActive('/albums') 
                                    ? 'font-bold' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            style={isActive('/albums') ? { color: '#2f7e33', backgroundColor: '#e8f5e9' } : {}}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            앨범
                        </Link>

                        <div className="h-px bg-gray-200 my-2" />

                        <Link
                            to="/mypage"
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isActive('/mypage') 
                                    ? 'font-bold' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            style={isActive('/mypage') ? { color: '#2f7e33', backgroundColor: '#e8f5e9' } : {}}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <User size={16} />
                            마이페이지
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                            <LogOut size={16} />
                            로그아웃
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default AppHeader;
