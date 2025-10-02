import Header from "@/components/site/header";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="mx-auto max-w-7xl w-full flex-1 flex flex-col items-center">
        <Header />
        <main className="flex-1 p-2 w-full flex flex-col">{children}</main>
        <p>Footer</p>
      </div>
    </div>
  );
}
