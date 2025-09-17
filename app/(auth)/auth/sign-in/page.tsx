"use client";
import { SignIn } from "@clerk/clerk-react";
import { useSearchParams } from "next/navigation";
import { sanitizeRedirect } from "@/utils/url-utils";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirectTo");
  const safeRedirect = sanitizeRedirect(rawRedirect);
  const finalRedirect = safeRedirect ?? "/";

  const qp =
    rawRedirect && safeRedirect
      ? new URLSearchParams({ redirectTo: safeRedirect })
      : null;

  return (
    <SignIn
      signUpUrl={`/auth/sign-up${qp ? `?${qp.toString()}` : ""}`}
      forceRedirectUrl={finalRedirect}
    />
  );
}
