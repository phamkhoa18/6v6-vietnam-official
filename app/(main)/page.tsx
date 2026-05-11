import { Metadata } from "next";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { TournamentsShowcase } from "@/components/sections/TournamentsShowcase";
import { NewsShowcase } from "@/components/sections/NewsShowcase";
import { StatsSection } from "@/components/sections/StatsSection";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = {
    title: "6v6 Vietnam Official - Giải Đấu Bóng Đá Sân 6 Chuyên Nghiệp",
    description: "Tổ chức và tham gia các giải đấu bóng đá sân 6 chuyên nghiệp tại Việt Nam.",
};

export default function Home() {
    return (
        <>
            <HeroSection />
            <StatsSection />
            <FeaturesSection />
            <HowItWorksSection />
            <TournamentsShowcase />
            <NewsShowcase />
            <CTASection />
        </>
    );
}
