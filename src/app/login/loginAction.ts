"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/application/useCases/auth/signIn";
import { ROUTES } from "@/shared/constants/routes";

export type LoginActionState = {
  error: string | null;
};

export async function loginAction(
  _prevState: unknown,
  formData: FormData,
): Promise<LoginActionState> {
  const emailRaw = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const email = emailRaw.trim();

  const result = await signIn(email, password);
  if (result.error) {
    return { error: result.error };
  }

  redirect(ROUTES.methodology);
}
