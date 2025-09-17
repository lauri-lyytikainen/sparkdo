"use client";
import { SignUp } from "@clerk/clerk-react";
import { useSearchParams } from "next/navigation";
import { sanitizeRedirect } from "@/utils/url-utils";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirectTo");
  const safeRedirect = sanitizeRedirect(rawRedirect);
  const finalRedirect = safeRedirect ?? "/";

  const qp =
    rawRedirect && safeRedirect
      ? new URLSearchParams({ redirectTo: safeRedirect })
      : null;

  return (
    <SignUp
      signInUrl={`/auth/sign-in${qp ? `?${qp.toString()}` : ""}`}
      forceRedirectUrl={finalRedirect}
    />
  );
}
