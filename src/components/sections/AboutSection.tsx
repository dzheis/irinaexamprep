"use client";

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { useScrollLock } from '@/components/ui/SmoothScroll';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import type { AboutBlockContent } from '@/lib/storyblok-types';

const CERT_BUTTON_CLASS =
  'relative rounded-md overflow-hidden transition-[filter] duration-200 hover:brightness-105 active:brightness-100 cursor-zoom-in select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50';

const LOCAL_CERTIFICATE_IMAGES: { src: string; alt: string }[] = [
  { src: '/Irina Petrova Certificates/1.jpeg', alt: 'Сертификат 1' },
  { src: '/Irina Petrova Certificates/2.jpeg', alt: 'Сертификат 2' },
  { src: '/Irina Petrova Certificates/3.jpeg', alt: 'Сертификат 3' },
  { src: '/Irina Petrova Certificates/4.jpeg', alt: 'Сертификат 4' },
  { src: '/Irina Petrova Certificates/5.jpeg', alt: 'Сертификат 5' },
  { src: '/Irina Petrova Certificates/6.jpeg', alt: 'Сертификат 6' },
];

const ABOUT_PARAGRAPHS = [
  'Последние 11 лет я работаю с продвинутыми студентами (B2–C2), готовлю к международным экзаменам и помогаю выходить на высокий уровень владения английским. За это время моё понимание того, как именно происходит прогресс, сильно изменилось.',
  'У меня классическое профильное образование — Bachelor’s degree in Philology. Но довольно быстро стало очевидно, что знать язык и уметь эффективно его преподавать — это две разные вещи.',
  'Как и мои студенты, я сама проходила весь экзаменационный путь: готовилась к IELTS, CAE и CPE, разбиралась, что действительно работает в условиях стресса и ограниченного времени, и почему даже сильные студенты застревают на высоких уровнях.',
  'Этот опыт стал отправной точкой для дальнейшего развития. Я сдала экзамены Cambridge вплоть до Proficiency (Grade A), прошла CELTA (Pass A) и сейчас завершаю магистратуру MEd TESOL, где углублённо изучаю процессы освоения языка и то, как обучение может их поддерживать.',
  'Мне близок структурный подход: чёткая система, последовательность, предсказуемость. Я работаю как индивидуально, так и в группах, а также веду собственные программы (Speaking Booster, Speaking Clubs).',
  'Независимо от формата, у каждого студента есть syllabus — подробная программа, по которой мы движемся на протяжении всего курса (в среднем 10–12 месяцев при подготовке к экзамену).',
  'На занятиях основной акцент делается на speaking, но это не просто бесцельное обсуждение тем. Мы учимся использовать язык: вводим лексику и грамматику в речь, отрабатываем стратегии выполнения экзаменационных заданий и подробно анализируем результаты (что получилось, где были ошибки и как их исправить).',
  'Моя задача — сделать так, чтобы студент понимал, как устроен экзамен, и чувствовал себя в нём уверенно, так как это напрямую влияет на результат.',
  'Но обучение не заканчивается после урока, так как я активно использую peer observation и совместную работу. Студенты практикуются вместе, проверяют письменные работы друг друга и учатся замечать и оценивать язык. Это развивает автономность и значительно ускоряет прогресс.',
  'По итогу студенты не только успешно сдают экзамен, но и достигают желаемого уровня, который применим не только в рамках экзамена.',
];

type AboutSectionProps = { data?: AboutBlockContent | null };

function paragraphsFromData(rows: AboutBlockContent['paragraphs']): string[] {
  if (!rows?.length) return [];
  return rows
    .map((p) => (typeof p === 'string' ? p : (p?.text ?? p?.content ?? '')?.trim()))
    .filter(Boolean) as string[];
}

type CertItem = NonNullable<AboutBlockContent['certificates']>[number];

/** Достаёт URL картинки из элемента сертификата (Storyblok может отдавать image как объект, строку или в content). */
function getCertImageUrl(c: CertItem): string {
  if (!c) return '';
  const img = c.image ?? (c as { content?: { image?: unknown } }).content?.image;
  if (typeof img === 'string') return img.trim();
  if (img && typeof img === 'object' && 'filename' in img) return String((img as { filename?: string }).filename ?? '').trim();
  const flat = (c as { filename?: string }).filename;
  return (flat ?? '').trim();
}

function certsFromStoryblok(items: AboutBlockContent['certificates']): { id: number; src: string; alt: string }[] {
  if (!items?.length) return [];
  return items.map((c, i) => {
    const src = getCertImageUrl(c);
    const alt = (c.alt ?? (c as { content?: { alt?: string } }).content?.alt ?? 'Сертификат').trim() || 'Сертификат';
    return { id: i + 1, src: src || '/icons/placeholder-certificate.svg', alt };
  });
}

export default function AboutSection({ data }: AboutSectionProps) {
  const aboutTitle = data?.title?.trim() || 'Обо мне';
  const paragraphsRaw = paragraphsFromData(data?.paragraphs);
  const paragraphs = paragraphsRaw.length > 0 ? paragraphsRaw : ABOUT_PARAGRAPHS;
  const allCertsFromData = certsFromStoryblok(data?.certificates);
  const localCertsWithIds = LOCAL_CERTIFICATE_IMAGES.map((c, i) => ({
    id: i + 1 + allCertsFromData.length,
    src: c.src,
    alt: c.alt,
  }));
  const allCertificates = [...allCertsFromData, ...localCertsWithIds];
  const hasCerts = allCertificates.length > 0;
  const sideCertificates = hasCerts ? allCertificates.slice(0, 3) : [];
  const bottomCertificates = hasCerts ? allCertificates.slice(3) : [];
  const rawImage = (data?.image?.filename ?? '')?.trim();
  const aboutImageSrc = rawImage || '/images/photos/irina_petrova_about.JPG';

  const [certModalOpen, setCertModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);
  const scrollLock = useScrollLock();

  useBodyScrollLock(certModalOpen);

  useEffect(() => {
    if (!certModalOpen) return;
    const id = requestAnimationFrame(() => setModalVisible(true));
    return () => cancelAnimationFrame(id);
  }, [certModalOpen]);

  useEffect(() => {
    if (!certModalOpen || !scrollLock) return;
    scrollLock.lockScroll();
    return () => scrollLock.unlockScroll();
  }, [certModalOpen, scrollLock]);

  const openCertModal = useCallback((src: string, alt: string) => {
    setModalImage({ src, alt });
    setCertModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (modalClosing) return;
    setModalClosing(true);
  }, [modalClosing]);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      if (e.propertyName === 'opacity' && modalClosing) {
        setCertModalOpen(false);
        setModalClosing(false);
        setModalVisible(false);
        setModalImage(null);
      }
    },
    [modalClosing]
  );

  return (
    <AnimatedSection id="about" animationDirection="up">
      {/* Mobile (<768px): one card with photo, text and certificates */}
      <div className="md:hidden">
        <div className="card w-full overflow-hidden border-0">
          <div className="relative w-[calc(100%+4rem)] -ml-8 -mt-8 aspect-[3/4] rounded-t-3xl overflow-hidden mb-6">
            <Image
              src={aboutImageSrc}
              alt="Ирина Петрова"
              fill
              className="object-cover object-top"
              sizes="(max-width: 767px) 100vw, 50vw"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-theme">
            {aboutTitle}
          </h2>
          <div className="w-full prose prose-lg max-w-none leading-relaxed text-theme [&_p]:text-justify [&_p]:indent-8 [&>p]:mb-4 [&>p:last-child]:mb-0">
            {paragraphs.map((text, i) => (
              <p key={i} className="text-base text-justify">
                {text}
              </p>
            ))}
          </div>
          {hasCerts && (
            <div className="flex flex-wrap justify-center gap-4 pt-6 mt-6 border-t border-theme/20">
              {sideCertificates.map((cert) => (
                <div
                  key={`mobile-${cert.id}`}
                  className={`relative w-[7.5rem] h-[10.5rem] ${CERT_BUTTON_CLASS}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => openCertModal(cert.src, cert.alt)}
                  onKeyDown={(e) => e.key === 'Enter' && openCertModal(cert.src, cert.alt)}
                  aria-label={`Открыть ${cert.alt} в полном размере`}
                >
                  <Image
                    src={cert.src}
                    alt={cert.alt}
                    fill
                    className="object-contain object-center"
                  />
                </div>
              ))}
              {bottomCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className={`relative w-[7.5rem] h-[10.5rem] ${CERT_BUTTON_CLASS}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => openCertModal(cert.src, cert.alt)}
                  onKeyDown={(e) => e.key === 'Enter' && openCertModal(cert.src, cert.alt)}
                  aria-label={`Открыть ${cert.alt} в полном размере`}
                >
                  <Image
                    src={cert.src}
                    alt={cert.alt}
                    fill
                    className="object-contain object-center"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop (≥768px): single card with background photo. overflow-x-hidden чтобы фон не вылезал; overflow-y-visible чтобы сертификаты внизу не обрезались. */}
      <div className="hidden md:block card relative overflow-x-hidden overflow-y-visible transition-[transform,box-shadow] duration-300 ease-in-out shadow-[0_8px_16px_rgba(47,52,64,0.08),0_20px_40px_rgba(47,52,64,0.08),0_24px_60px_rgba(47,52,64,0.06)] hover:shadow-[0_12px_24px_rgba(47,52,64,0.1),0_28px_56px_rgba(47,52,64,0.1),0_32px_72px_rgba(47,52,64,0.08)] hover:scale-[1.01]">
        <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden">
          <Image
            src={aboutImageSrc}
            alt="Ирина Петрова"
            fill
            className="object-cover opacity-[0.75]"
          />
          <div className="absolute inset-0 about-overlay" />
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-8 justify-between">
            <div className="w-full max-w-full min-[640px]:max-w-[50%] lg:w-1/2 lg:max-w-none lg:pr-4 flex flex-col">
              <h2 className="text-3xl md:text-4xl min-[1200px]:text-5xl min-[1200px]:md:text-6xl font-bold mb-6 text-left text-white">
                {aboutTitle}
              </h2>

              <div className="prose prose-lg max-w-none leading-relaxed text-white min-h-0 overflow-visible text-left [&_p]:text-justify [&>p]:mb-4 [&>p:last-child]:mb-0">
                {paragraphs.map((text, i) => (
                  <p
                    key={i}
                    className="text-base md:text-lg min-[1200px]:text-xl min-[1200px]:md:text-2xl text-justify indent-8"
                  >
                    {text}
                  </p>
                ))}
              </div>
            </div>

            {hasCerts && sideCertificates.length > 0 && (
              <div className="hidden lg:flex flex-col gap-4 flex-shrink-0 ml-auto">
                {sideCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className={`w-48 h-[16.5rem] ${CERT_BUTTON_CLASS}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => openCertModal(cert.src, cert.alt)}
                    onKeyDown={(e) => e.key === 'Enter' && openCertModal(cert.src, cert.alt)}
                    aria-label={`Открыть ${cert.alt} в полном размере`}
                  >
                    <Image
                      src={cert.src}
                      alt={cert.alt}
                      fill
                      className="object-contain object-center"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {hasCerts && (
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4 border-t border-theme-warm-ui">
              {sideCertificates.map((cert) => (
                <div
                  key={`mobile-${cert.id}`}
                  className={`lg:hidden relative w-[7.5rem] h-[10.5rem] sm:w-[9rem] sm:h-[12rem] ${CERT_BUTTON_CLASS}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => openCertModal(cert.src, cert.alt)}
                  onKeyDown={(e) => e.key === 'Enter' && openCertModal(cert.src, cert.alt)}
                  aria-label={`Открыть ${cert.alt} в полном размере`}
                >
                  <Image
                    src={cert.src}
                    alt={cert.alt}
                    fill
                    className="object-contain object-center"
                  />
                </div>
              ))}
              {bottomCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className={`relative w-[7.5rem] h-[10.5rem] sm:w-[9rem] sm:h-[12rem] ${CERT_BUTTON_CLASS}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => openCertModal(cert.src, cert.alt)}
                  onKeyDown={(e) => e.key === 'Enter' && openCertModal(cert.src, cert.alt)}
                  aria-label={`Открыть ${cert.alt} в полном размере`}
                >
                  <Image
                    src={cert.src}
                    alt={cert.alt}
                    fill
                    className="object-contain object-center"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full-screen certificate modal */}
      {certModalOpen &&
        modalImage &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 transition-opacity duration-500 ease-out ${
              modalVisible && !modalClosing ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleCloseModal}
            onTransitionEnd={handleTransitionEnd}
            onWheel={(e) => {
              if (e.target === e.currentTarget) e.preventDefault();
              e.stopPropagation();
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`${modalImage.alt} в полном размере`}
          >
            <div
              className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none p-4"
              aria-hidden
            >
              <div
                className={`relative w-full h-full max-w-[80vw] max-h-[80vh] origin-center transition-transform duration-500 ease-out ${
                  modalVisible && !modalClosing ? 'scale-100' : 'scale-[0.85]'
                }`}
              >
                <Image
                  src={modalImage.src}
                  alt={`${modalImage.alt} — полный размер`}
                  fill
                  className="object-contain"
                  sizes="80vw"
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </AnimatedSection>
  );
}
