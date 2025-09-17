export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-w-screen min-h-screen flex justify-center items-center">
      {children}
    </div>
  );
}
