"use client";

import { useEffect, useState } from "react";
import { Particles } from "@/components/ui/particles";

const SHOW_PARTICLES = true;

type FreeResourceItem = {
  id: string;
  title: string;
  description: string;
  downloadUrl?: string;
  downloadFilename?: string;
};

const SAMPLE_FILE_URL = "/free-resources/sample-download.txt";

const FREE_RESOURCES: FreeResourceItem[] = [
  {
    id: "1",
    title: "Чек-лист подготовки к FCE",
    description:
      "Пошаговый чек-лист для самостоятельной подготовки к экзамену FCE (B2): что повторить по каждой части, как распределить время и на что обратить внимание в день экзамена.",
    downloadUrl: SAMPLE_FILE_URL,
    downloadFilename: "checklist-fce.txt",
  },
  {
    id: "2",
    title: "Шаблон эссе CAE",
    description:
      "Структурированный шаблон для написания эссе в формате CAE (C1) с подсказками по объёму, связкам и типичным фразам для введения и заключения.",
    downloadUrl: SAMPLE_FILE_URL,
    downloadFilename: "template-essay-cae.txt",
  },
  {
    id: "3",
    title: "Полезные ссылки по грамматике",
    description:
      "Подборка проверенных ресурсов и статей по грамматике английского языка для уровней B2–C2: правила, упражнения и примеры из аутентичных источников.",
    downloadUrl: SAMPLE_FILE_URL,
    downloadFilename: "grammar-links.txt",
  },
];

function ResourceCard({ item }: { item: FreeResourceItem }) {
  const href = item.downloadUrl ?? "#";
  const isDownload = href !== "#" && !href.startsWith("http");

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full min-w-0">
      <div className="glass rounded-2xl p-6 md:p-8 flex items-center justify-center text-center min-h-[120px] md:min-h-[140px] w-full md:w-[36%] lg:w-[32%] flex-shrink-0 transition-[transform,box-shadow] duration-300 ease-in-out hover:scale-[1.01] hover:shadow-xl">
        <h2 className="text-xl md:text-2xl font-bold text-theme">
          {item.title}
        </h2>
      </div>

      <div className="glass rounded-2xl p-6 md:p-8 flex flex-col flex-1 min-w-0 min-h-0 transition-[transform,box-shadow] duration-300 ease-in-out hover:scale-[1.01] hover:shadow-xl">
        <div className="prose prose-theme max-w-none text-theme text-justify leading-relaxed [&>*]:text-justify break-words flex-1">
          <p className="whitespace-pre-line">{item.description}</p>
        </div>
        <div className="mt-4 flex justify-end flex-shrink-0">
          <a
            href={href}
            className="btn-primary text-base md:text-lg px-8 py-3 md:py-4 inline-flex items-center justify-center"
            {...(isDownload
              ? {
                  download: item.downloadFilename ?? undefined,
                  target: "_self",
                }
              : {
                  target: href.startsWith("http") ? "_blank" : undefined,
                  rel: href.startsWith("http") ? "noopener noreferrer" : undefined,
                })}
          >
            Скачать
          </a>
        </div>
      </div>
    </div>
  );
}

export default function FreeResourcesClient() {
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
    <div className="rose-petals-bg relative">
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
        <div className="pt-24 md:pt-28">
          <section className="py-20 md:py-28 max-w-[1680px] mx-auto px-4 md:px-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-14 md:mb-20 text-theme">
              Free resources
            </h1>

            <div className="flex flex-col gap-8 md:gap-10">
              {FREE_RESOURCES.map((item) => (
                <ResourceCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
