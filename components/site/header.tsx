"use client";
import Link from "next/link";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignUpButton, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";

export default function Header() {
  return (
    <header className="w-full flex justify-between items-center p-2">
      <Link href="/" className="flex items-center gap-2">
        <p>Logo</p>
        <h2 className="text-2xl font-bold">Sparkdo</h2>
      </Link>
      <div className="flex items-center gap-2">
        <Authenticated>
          <Link href="/dashboard">
            <Button variant="outline">
              <p>Dashboard</p>
            </Button>
          </Link>
          <UserButton />
        </Authenticated>
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
