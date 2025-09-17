import Header from "@/components/site/Header";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="mx-auto max-w-xl w-full flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-2">{children}</main>
        <p>Footer</p>
      </div>
    </div>
  );
}
