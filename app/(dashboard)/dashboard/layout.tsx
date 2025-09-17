export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <p>Dashboard Layout</p>
      {children}
    </div>
  );
}
