"use client";

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { useScrollLock } from '@/components/ui/SmoothScroll';

const sideCertificates = [
  { id: 1, src: '/icons/placeholder-certificate.svg', alt: 'Сертификат CELTA' },
  { id: 2, src: '/icons/placeholder-certificate.svg', alt: 'Сертификат DELTA' },
  { id: 3, src: '/icons/placeholder-certificate.svg', alt: 'Сертификат Cambridge' },
];

const bottomCertificates = [
  { id: 4, src: '/icons/placeholder-certificate.svg', alt: 'Сертификат IELTS Expert' },
  { id: 5, src: '/icons/placeholder-certificate.svg', alt: 'Сертификат TOEFL Trainer' },
  { id: 6, src: '/icons/placeholder-certificate.svg', alt: 'Сертификат CPE' },
  { id: 7, src: '/icons/placeholder-certificate.svg', alt: 'Сертификат TKT' },
];

const CERT_BUTTON_CLASS =
  'relative rounded-lg overflow-hidden transition-[filter,box-shadow] duration-200 hover:brightness-105 hover:shadow-lg active:brightness-100 cursor-zoom-in select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50';

const ABOUT_PARAGRAPHS = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
    'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.',
    'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
    'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.',
    'Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Et harum quidem rerum facilis est et expedita distinctio.',
    'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
    'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.',
];

export default function AboutSection() {
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);
  const scrollLock = useScrollLock();

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
              src="/images/photos/irina_petrova_about.JPG"
              alt="Ирина Петрова"
              fill
              className="object-cover object-top"
              sizes="(max-width: 767px) 100vw, 50vw"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-theme">
            Обо мне
          </h2>
          <div className="w-full prose prose-lg max-w-none leading-relaxed text-theme [&_p]:text-justify [&_p]:indent-8 [&>p]:mb-4 [&>p:last-child]:mb-0">
            {ABOUT_PARAGRAPHS.map((text, i) => (
              <p key={i} className="text-base text-justify">
                {text}
              </p>
            ))}
          </div>
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
        </div>
      </div>

      {/* Desktop (≥768px): single card with background photo */}
      <div className="hidden md:block card relative overflow-hidden transition-[transform,box-shadow] duration-300 ease-in-out shadow-[0_8px_16px_rgba(47,52,64,0.08),0_20px_40px_rgba(47,52,64,0.08),0_24px_60px_rgba(47,52,64,0.06)] hover:shadow-[0_12px_24px_rgba(47,52,64,0.1),0_28px_56px_rgba(47,52,64,0.1),0_32px_72px_rgba(47,52,64,0.08)] hover:scale-[1.01]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/photos/irina_petrova_about.JPG"
            alt="Ирина Петрова"
            fill
            className="object-cover opacity-[0.75]"
          />
          <div className="absolute inset-0 about-overlay" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 min-h-0 flex-1">
          <div className="flex flex-col lg:flex-row gap-8 justify-between min-h-0 flex-1">
            <div className="w-full max-w-full min-[640px]:max-w-[50%] lg:w-1/2 lg:max-w-none lg:pr-4 min-h-0 flex flex-col">
              <h2 className="text-3xl md:text-4xl min-[1200px]:text-5xl min-[1200px]:md:text-6xl font-bold mb-6 text-left text-white">
                Обо мне
              </h2>

              <div className="prose prose-lg max-w-none leading-relaxed text-white min-h-0 overflow-visible text-left [&_p]:text-justify [&>p]:mb-4 [&>p:last-child]:mb-0">
                {ABOUT_PARAGRAPHS.map((text, i) => (
                  <p
                    key={i}
                    className="text-base md:text-lg min-[1200px]:text-xl min-[1200px]:md:text-2xl text-justify indent-8"
                  >
                    {text}
                  </p>
                ))}
              </div>
            </div>

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
          </div>

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
