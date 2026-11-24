import './globals.css'; // or your global css path if different

export const metadata = {
  title: 'LANK AI',
  description: 'Multilingual Interpreter Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}