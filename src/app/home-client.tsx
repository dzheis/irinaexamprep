"use client";

import AboutSection from "@/components/sections/AboutSection";
import CTASection from "@/components/sections/CTASection";
import CoursesMethodologySection from "@/components/sections/CoursesMethodologySection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HeroSection from "@/components/sections/HeroSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";

type HomeClientProps = {
  title: string;
  description: string;
  intro?: string;
  imageUrl?: string;
};

export default function HomeClient({ title, description, intro, imageUrl }: HomeClientProps) {
  return (
    <div className="min-h-screen relative">
      <div className="relative z-10">
        <HeroSection title={title} description={description} intro={intro} imageUrl={imageUrl} />
        <CoursesMethodologySection />
        <TestimonialsSection />
        <AboutSection />
        <FeaturesSection />
        <CTASection />
      </div>
    </div>
  );
}
