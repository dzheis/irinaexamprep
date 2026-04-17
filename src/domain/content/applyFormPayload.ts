/** Normalized apply-form payload — single domain shape for validation and downstream use. */
export type ApplyFormPayload = {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  telegram?: string;
  instagram?: string;
  whatsapp?: string;
  courseId: number;
  courseTitle?: string;
};
