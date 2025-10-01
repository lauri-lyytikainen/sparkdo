"use client";
import Link from "next/link";
import { Authenticated, Unauthenticated } from "convex/react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useConvexAuth } from "convex/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";

export default function Header() {
  const { isLoading } = useConvexAuth();
  return (
    <header className="w-full flex justify-between items-center p-2">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/sparkdo.svg" alt="Logo" width={32} height={32} className="rounded-md" />
        <h2 className="text-2xl font-bold">Sparkdo</h2>
      </Link>
      <div className="flex items-center gap-2">
        <Authenticated>
          <Link href="/dashboard">
            <Button variant="outline" size={"sm"}>
              Dashboard
            </Button>
          </Link>
          <UserButton showName={true} userProfileUrl="/account" />
        </Authenticated>
        {isLoading && (
          <>
            <Button variant="outline" size="sm" disabled>
              <Loader2Icon className="animate-spin" />
              Dashboard
            </Button>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </>
        )}
        <Unauthenticated>
          <Link href={"/auth/sign-in"}>
            <Button variant={"outline"}>Sign In</Button>
          </Link>
          <Link href={"/auth/sign-up"}>
            <Button>Sign Up</Button>
          </Link>
        </Unauthenticated>
      </div>
    </header>
  );
}
