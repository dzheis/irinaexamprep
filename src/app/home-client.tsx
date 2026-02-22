"use client";

import { useEffect, useState } from "react";

import AboutSection from "@/components/AboutSection";
import CTASection from "@/components/CTASection";
import CoursesMethodologySection from "@/components/CoursesMethodologySection";
import FeaturesSection from "@/components/FeaturesSection";
import HeroSection from "@/components/HeroSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import { Particles } from "@/components/ui/particles";

const SHOW_PARTICLES = true;

type HomeClientProps = {
  title: string;
  description: string;
  imageUrl?: string;
};

export default function HomeClient({ title, description, imageUrl }: HomeClientProps) {
  const [particlesConfig, setParticlesConfig] = useState<{
    show: boolean;
    quantity: number;
  } | null>(null);

  useEffect(() => {
    if (!SHOW_PARTICLES) return;

    const mqMobile = window.matchMedia("(max-width: 768px)");
    const mqNarrow = window.matchMedia("(max-width: 1280px)");
    const mqParticles = window.matchMedia("(min-width: 1280px)");

    const update = () => {
      setParticlesConfig({
        show: mqParticles.matches,
        quantity: mqMobile.matches ? 25 : mqNarrow.matches ? 35 : 45,
      });
    };

    update();
    mqMobile.addEventListener("change", update);
    mqNarrow.addEventListener("change", update);
    mqParticles.addEventListener("change", update);

    return () => {
      mqMobile.removeEventListener("change", update);
      mqNarrow.removeEventListener("change", update);
      mqParticles.removeEventListener("change", update);
    };
  }, []);

  return (
    <div className="gradient-bg relative">
      {SHOW_PARTICLES && particlesConfig?.show && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Particles
            className="fixed inset-0 w-screen h-screen"
            quantity={particlesConfig.quantity}
            ease={30}
            color="#C9B7AE"
            size={35}
            staticity={15}
            vx={0.35}
            vy={0.3}
            opacity={0.7}
          />
        </div>
      )}
      <div className="relative z-10">
        <HeroSection title={title} description={description} imageUrl={imageUrl} />
        <CoursesMethodologySection />
        <TestimonialsSection />
        <AboutSection />
        <FeaturesSection />
        <CTASection />
      </div>
    </div>
  );
}
