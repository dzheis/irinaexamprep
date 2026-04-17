import { validateSignUpInput } from "@/domain/auth/credentialsPolicy";

/** Client-side signup still uses Supabase in the browser; this is the shared validation gate. */
export function validateSignUpForm(params: {
  email: string;
  password: string;
  confirmPassword: string;
}) {
  return validateSignUpInput(params);
}
