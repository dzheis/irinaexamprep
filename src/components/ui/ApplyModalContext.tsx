"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  ReactNode,
} from "react";
import { useForm } from "react-hook-form";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { ROUTES } from "@/presentation/routes";

const TEXT_ONLY_PATTERN = /^[a-zA-Zа-яА-ЯёЁ\s\-']*$/;
const TEXT_ONLY_MSG = "Для ввода доступен только текст";

const INPUT_BASE_CLASS =
  "w-full px-4 py-3 rounded-xl border bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-theme-secondary-accent/50 transition-all duration-300 input-theme";
const INPUT_ERROR_CLASS = "border-red-500 focus:ring-red-400 focus:border-red-500";

type ApplyFormData = {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  telegram: string;
  instagram: string;
  whatsapp: string;
  consentPersonalData: boolean;
};

type ApplyModalContextValue = {
  openApplyModal: (courseId: number, courseTitle: string) => void;
};

const ApplyModalContext = createContext<ApplyModalContextValue | null>(null);

export function useApplyModal() {
  const ctx = useContext(ApplyModalContext);
  return ctx;
}

type ApplyModalProps = {
  courseId: number;
  courseTitle: string;
  onClose: () => void;
};

function ApplyModal({ courseId, courseTitle, onClose }: ApplyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ApplyFormData>({ mode: "onChange" });

  const overlayRef = useRef<HTMLDivElement>(null);

  const startClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
  }, [isClosing]);

  useBodyScrollLock(true);

  useEffect(() => {
    const t = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const onSubmit = async (data: ApplyFormData) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          middleName: data.middleName?.trim() || undefined,
          email: data.email.trim(),
          telegram: data.telegram?.trim() || undefined,
          instagram: data.instagram?.trim() || undefined,
          whatsapp: data.whatsapp?.trim() || undefined,
          courseId,
          courseTitle: courseTitle || "Заявка",
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setSubmitError(result.error || "Не удалось отправить заявку");
        return;
      }
      reset();
      setIsSuccess(true);
      setTimeout(() => setIsClosing(true), 2200);
    } catch {
      setSubmitError("Ошибка соединения. Попробуйте позже.");
    }
  };

  useEffect(() => {
    if (!isClosing) return;
    const el = overlayRef.current;
    if (!el) {
      onClose();
      return;
    }
    const onEnd = () => onClose();
    el.addEventListener("transitionend", onEnd, { once: true });
    return () => el.removeEventListener("transitionend", onEnd);
  }, [isClosing, onClose]);

  const show = isOpen && !isClosing;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 overflow-hidden touch-none ${
        show ? "opacity-100" : "opacity-0"
      }`}
      onClick={isClosing ? undefined : startClose}
      onWheel={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
        e.stopPropagation();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
    >
      <div
        className={`card max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto transition-all duration-300 touch-auto ${
          show ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {!isSuccess ? (
          <>
            <div className="relative mb-5">
              <h3 id="apply-modal-title" className="text-xl font-bold text-theme text-center">
                Подать заявку
              </h3>
              <button
                type="button"
                onClick={startClose}
                className="absolute top-0 right-0 text-theme-accent hover:text-theme text-2xl leading-none p-1"
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme mb-1">
                  Имя <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("firstName", {
                    required: "Обязательное поле",
                    validate: (v) => !v.trim() || TEXT_ONLY_PATTERN.test(v) || TEXT_ONLY_MSG,
                  })}
                  placeholder="Имя"
                  className={`${INPUT_BASE_CLASS} ${errors.firstName ? INPUT_ERROR_CLASS : ""}`}
                  onChange={(e) => {
                    register("firstName").onChange(e);
                    if (TEXT_ONLY_PATTERN.test(e.target.value)) clearErrors("firstName");
                  }}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-theme mb-1">
                  Фамилия <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("lastName", {
                    required: "Обязательное поле",
                    validate: (v) => !v.trim() || TEXT_ONLY_PATTERN.test(v) || TEXT_ONLY_MSG,
                  })}
                  placeholder="Фамилия"
                  className={`${INPUT_BASE_CLASS} ${errors.lastName ? INPUT_ERROR_CLASS : ""}`}
                  onChange={(e) => {
                    register("lastName").onChange(e);
                    if (TEXT_ONLY_PATTERN.test(e.target.value)) clearErrors("lastName");
                  }}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-theme mb-1">Отчество</label>
                <input
                  {...register("middleName", {
                    validate: (v) => !v?.trim() || TEXT_ONLY_PATTERN.test(v) || TEXT_ONLY_MSG,
                  })}
                  placeholder="Отчество"
                  className={`${INPUT_BASE_CLASS} ${errors.middleName ? INPUT_ERROR_CLASS : ""}`}
                  onChange={(e) => {
                    register("middleName").onChange(e);
                    if (!e.target.value.trim() || TEXT_ONLY_PATTERN.test(e.target.value))
                      clearErrors("middleName");
                  }}
                />
                {errors.middleName && (
                  <p className="mt-1 text-sm text-red-500">{errors.middleName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-theme mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("email", {
                    required: "Обязательное поле",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Некорректный email",
                    },
                  })}
                  type="email"
                  placeholder="Email"
                  className={`${INPUT_BASE_CLASS} ${errors.email ? INPUT_ERROR_CLASS : ""}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-theme mb-1">Никнейм в TG</label>
                <input
                  {...register("telegram")}
                  placeholder="@username"
                  className={INPUT_BASE_CLASS}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme mb-1">
                  Никнейм в Instagram
                </label>
                <input
                  {...register("instagram")}
                  placeholder="@username"
                  className={INPUT_BASE_CLASS}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme mb-1">WhatsApp</label>
                <input
                  {...register("whatsapp")}
                  placeholder="+7 999 123-45-67"
                  className={INPUT_BASE_CLASS}
                />
              </div>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="apply-consent-pd"
                  {...register("consentPersonalData", {
                    required: "Необходимо дать согласие на обработку персональных данных",
                  })}
                  className="mt-1 rounded border-theme/30 text-theme-accent focus:ring-theme-accent"
                />
                <label htmlFor="apply-consent-pd" className="text-sm text-theme/90">
                  Даю согласие на обработку персональных данных в соответствии с{" "}
                  <a
                    href={ROUTES.privacy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-theme-accent hover:text-theme"
                  >
                    политикой конфиденциальности
                  </a>
                  .
                </label>
              </div>
              {errors.consentPersonalData && (
                <p className="text-sm text-red-500">{errors.consentPersonalData.message}</p>
              )}
              {submitError && <p className="text-sm text-red-500">{submitError}</p>}
              <p className="text-xs text-theme/80 mb-3">
                Отправляя заявку, вы также соглашаетесь с{" "}
                <a
                  href={ROUTES.offer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-theme-accent hover:text-theme"
                >
                  договором оферты
                </a>
                .
              </p>
              <button
                type="submit"
                className="btn-primary w-full text-lg px-8 py-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Отправка…" : "Отправить заявку"}
              </button>
            </form>
          </>
        ) : (
          <div className="py-6 text-center">
            <p className="text-xl font-semibold text-theme">
              Спасибо за выбор, мы свяжемся с вами в кратчайшие сроки!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApplyModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<{ courseId: number; courseTitle: string } | null>(null);

  const openApplyModal = useCallback((courseId: number, courseTitle: string) => {
    setModal({ courseId, courseTitle });
  }, []);

  const closeApplyModal = useCallback(() => {
    setModal(null);
  }, []);

  const contextValue = useMemo(() => ({ openApplyModal }), [openApplyModal]);

  return (
    <ApplyModalContext.Provider value={contextValue}>
      {children}
      {modal !== null && (
        <ApplyModal
          courseId={modal.courseId}
          courseTitle={modal.courseTitle}
          onClose={closeApplyModal}
        />
      )}
    </ApplyModalContext.Provider>
  );
}
