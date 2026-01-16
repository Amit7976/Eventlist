import { signIn } from "next-auth/react";


export async function credentialsLogin(email: string, password: string) {
  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  return result?.error || null;
}
