"use client";
import { UserProfile } from "@clerk/clerk-react";
import { Authenticated } from "convex/react";
export default function UserProfileView() {
  return (
    <Authenticated>
      <UserProfile />
    </Authenticated>
  );
}
