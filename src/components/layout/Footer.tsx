import { Link } from "react-router-dom";
import { Mail, Sparkles } from "lucide-react";

const Footer = () => {
    return (
        <footer className="border-t bg-muted/30">
            <div className="container py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* 브랜드 영역 */}
                    <div className="space-y-3">
                        <Link to="/" className="text-2xl font-bold text-primary">
                            Once
                        </Link>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            모임 준비부터 추억까지<br />한 흐름으로
                        </p>
                    </div>

                    {/* 서비스 메뉴 */}
                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">서비스</h3>
                        <ul className="space-y-2 text-sm leading-relaxed">
                            <li>
                                <Link
                                    to="/calendar"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    캘린더
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/groups"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    그룹
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/albums"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    앨범
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 계정 관련 메뉴 */}
                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">계정</h3>
                        <ul className="space-y-2 text-sm leading-relaxed pl-6"> {/* 아이콘 정렬 보정용 */}
                            <li>
                                <Link
                                    to="/auth/login"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    로그인
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/auth/signup"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    회원가입
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/auth/find-password"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    비밀번호 찾기
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 기타 메뉴 */}
                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">기타</h3>
                        <ul className="space-y-2 text-sm leading-relaxed">
                            <li>
                                <Link
                                    to="/contact"
                                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Mail size={16} className="-ml-[2px]" /> {/* 살짝 좌측 보정 */}
                                    문의하기
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/features"
                                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Sparkles size={16} className="-ml-[2px]" />
                                    기능소개
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* 하단 저작권 및 정책 링크 */}
                <div className="mt-12 pt-8 border-t border-border">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                        <p>© 2025 Once. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link to="/terms" className="hover:text-primary transition-colors">
                                이용약관
                            </Link>
                            <Link to="/privacy" className="hover:text-primary transition-colors">
                                개인정보처리방침
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;