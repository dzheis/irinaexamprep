"use client";

import AboutSection from "@/components/sections/AboutSection";
import CTASection from "@/components/sections/CTASection";
import CoursesMethodologySection from "@/components/sections/CoursesMethodologySection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HeroSection from "@/components/sections/HeroSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import type {
  AboutBlockContent,
  CtaBlockContent,
  FeaturesBlockContent,
  TestimonialsBlockContent,
  CoursesSectionBlockContent,
} from "@/lib/storyblok-types";

type HomeClientProps = {
  title: string;
  description: string;
  intro?: string;
  imageUrl?: string;
  about?: AboutBlockContent;
  cta?: CtaBlockContent;
  features?: FeaturesBlockContent;
  testimonials?: TestimonialsBlockContent;
  coursesSection?: CoursesSectionBlockContent;
};

export default function HomeClient({
  title,
  description,
  intro,
  imageUrl,
  about,
  cta,
  features,
  testimonials,
  coursesSection,
}: HomeClientProps) {
  return (
    <div className="min-h-screen relative">
      <div className="relative z-10">
        <HeroSection
          title={title}
          description={description}
          {...(intro ? { intro } : {})}
          {...(imageUrl ? { imageUrl } : {})}
        />
        <CoursesMethodologySection {...(coursesSection ? { data: coursesSection } : {})} />
        <TestimonialsSection {...(testimonials ? { data: testimonials } : {})} />
        <AboutSection {...(about ? { data: about } : {})} />
        <FeaturesSection {...(features ? { data: features } : {})} />
        <CTASection {...(cta ? { data: cta } : {})} />
      </div>
    </div>
  );
}
