import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import UserScenarios from "@/components/home/UserScenarios";
import FAQ from "@/components/home/FAQ";

const Index = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <main className="flex-1">
                <Hero/>
                <UserScenarios/>
                <Features/>
                <FAQ/>
            </main>
            <Footer/>
        </div>
    );
};

export default Index;
