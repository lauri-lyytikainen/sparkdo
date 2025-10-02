"use client";
import { UserProfile } from "@clerk/clerk-react";
import { Authenticated } from "convex/react";
export default function UserProfileView() {
  return (
    <Authenticated>
      <div className="flex flex-1 justify-center items-center">
        <UserProfile />
      </div>
    </Authenticated>
  );
}
