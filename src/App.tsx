import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import FindId from "./pages/auth/FindId";
import FindPassword from "./pages/auth/FindPassword";
import NotFound from "./pages/NotFound";

import Dashboard from "./pages/app/Dashboard";
import Albums from "./pages/app/Albums";
import Calendar from "./pages/app/Calendar";

import Groups from "./pages/group/Groups";
import GroupDetail from "./pages/group/GroupDetail"; // ★ 추가

import Contact from "./pages/Contact";
import Features from "./pages/Features";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <Routes>
                    {/* 메인 라우트 */}
                    <Route path="/" element={<Index />} />

                    {/* 인증 */}
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/signup" element={<Signup />} />
                    <Route path="/auth/find-id" element={<FindId />} />
                    <Route path="/auth/find-password" element={<FindPassword />} />

                    {/* 앱 내부 페이지 */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/albums" element={<Albums />} />
                    <Route path="/calendar" element={<Calendar />} />

                    {/* 그룹 기능 */}
                    <Route path="/groups" element={<Groups />} />
                    <Route path="/groups/:groupId" element={<GroupDetail />} /> {/* ★ 중요 ★ */}

                    {/* 기타 */}
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/features" element={<Features />} />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;