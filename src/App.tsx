import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import FindId from "./pages/auth/FindId";
import FindPassword from "./pages/auth/FindPassword";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/app/Dashboard";
import Albums from "./pages/app/Albums";
import Calendar from "./pages/app/Calendar";
import Groups from "./pages/app/Groups";
import Contact from "./pages/Contact";
import Features from "./pages/Features";


const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster/>
            <Sonner/>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Index/>}/>
                    <Route path="/auth/login" element={<Login/>}/>
                    <Route path="/auth/signup" element={<Signup/>}/>
                    <Route path="/auth/find-id" element={<FindId/>}/>
                    <Route path="/auth/find-password" element={<FindPassword/>}/>
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route path="/albums" element={<Albums/>}/>
                    <Route path="/calendar" element={<Calendar/>}/>
                    <Route path="/groups" element={<Groups/>}/>
                    <Route path="/contact" element={<Contact/>}/>
                    <Route path="/features" element={<Features/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
