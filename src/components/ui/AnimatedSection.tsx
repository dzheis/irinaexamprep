"use client";

import { useRef, useEffect, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DURATION = 0.8;
const EASE = "power2.out";

type AnimatedSectionProps = {
  children: ReactNode;
  animationDirection?: "up" | "down" | "left" | "right";
  className?: string;
  containerClassName?: string;
  id?: string;
};

export default function AnimatedSection({
  children,
  animationDirection = "up",
  className = "",
  containerClassName = "max-w-7xl mx-auto",
  id,
}: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const getInitialState = () => {
      switch (animationDirection) {
        case "up":
          return { opacity: 0, y: 60 };
        case "down":
          return { opacity: 0, y: -60 };
        case "left":
          return { opacity: 0, x: -60 };
        case "right":
          return { opacity: 0, x: 60 };
        default:
          return { opacity: 0, y: 60 };
      }
    };

    gsap.set(content, getInitialState());

    const animation = gsap.to(content, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: DURATION,
      ease: EASE,
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        once: true,
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === section) t.kill();
      });
    };
  }, [animationDirection]);

  return (
    <section
      id={id}
      className={`section py-16 md:py-24 ${className} ${id ? "scroll-mt-20" : ""}`}
      ref={sectionRef}
    >
      <div className={containerClassName}>
        <div ref={contentRef}>{children}</div>
      </div>
    </section>
  );
}
