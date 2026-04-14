"use client";

import Link from "next/link";
import Image from "next/image";
import AnimatedButtonText from "@/components/ui/AnimatedButtonText";
import { useLanguage } from "@/components/ui/LanguageContext";

const DEFAULT_INTRO =
  "Курсы для студентов продвинутого уровня, которые хотят сдать FCE, CAE или CPE и уверенно использовать английский на высоком уровне. Также на сайте вы найдете материалы по методике преподавания для учителей английского.";
type HeroSectionProps = {
  title: string;
  description: string;
  intro?: string;
  imageUrl?: string;
};

export default function HeroSection({ title, description, intro, imageUrl }: HeroSectionProps) {
  const { localizeText } = useLanguage();
  const textIntro = intro?.trim() || DEFAULT_INTRO;

  return (
    <section className="hero relative overflow-hidden">
      <div className="section relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 flex justify-center lg:justify-end relative z-10 order-1 lg:order-2">
            <div className="relative w-full max-w-lg lg:max-w-xl">
              <div className="relative w-full h-full rounded-3xl overflow-hidden">
                <Image
                  src={imageUrl || "/images/photos/irina_petrova.JPG"}
                  alt="Irina Petrova"
                  width={600}
                  height={800}
                  className="object-cover w-full h-auto rounded-3xl opacity-90"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6 lg:gap-8 text-left order-2 lg:order-1">
            <h1 className="w-full text-3xl md:text-4xl lg:text-5xl min-[1200px]:text-5xl min-[1200px]:md:text-6xl min-[1200px]:lg:text-7xl font-bold tracking-tight leading-tight text-center text-theme">
              {localizeText(title)}
            </h1>
            <p className="text-base md:text-lg min-[1200px]:text-xl min-[1200px]:md:text-2xl font-semibold text-theme/95 text-center lg:text-justify max-w-xl">
              {localizeText(textIntro)}
            </p>
            {description ? (
              <p className="text-base md:text-lg lg:text-xl min-[1200px]:text-xl min-[1200px]:md:text-2xl min-[1200px]:lg:text-3xl leading-relaxed opacity-90 text-center lg:text-left text-theme">
                {localizeText(description)}
              </p>
            ) : null}
            <div className="flex flex-col min-[476px]:flex-row flex-wrap items-center justify-center gap-4 mt-2">
              <Link
                href="/courses"
                className="btn-primary text-lg px-8 py-4 w-full min-[476px]:w-auto justify-center"
              >
                <AnimatedButtonText text={localizeText("Начать обучение")} />
              </Link>
              <Link
                href="/methodology"
                className="btn-secondary text-lg px-8 py-4 w-full min-[476px]:w-auto justify-center"
              >
                <AnimatedButtonText text={localizeText("Методика")} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
