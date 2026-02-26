"use client";

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
        <h2 className="text-lg md:text-xl min-[1200px]:text-2xl min-[1200px]:md:text-3xl font-bold text-theme">
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
            className="btn-primary text-sm md:text-base min-[1200px]:text-lg min-[1200px]:md:text-xl px-8 py-3 md:py-4 inline-flex items-center justify-center"
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
  return (
    <div className="rose-petals-bg relative">
      <div className="relative z-10">
        <div className="pt-24 md:pt-28">
          <section className="py-20 md:py-28 max-w-[1680px] mx-auto px-4 md:px-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl min-[1200px]:text-5xl min-[1200px]:md:text-6xl min-[1200px]:lg:text-7xl font-bold text-center mb-14 md:mb-20 text-theme">
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
