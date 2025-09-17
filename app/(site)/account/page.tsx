import UserProfileView from "@/components/site/user-profile";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Account() {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated)
    redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth/sign-in`);
  return <UserProfileView />;
}
