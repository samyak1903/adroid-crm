import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { ClientAuthShell } from "@/components/ClientAuthShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Adroit Sales CRM",
  description: "Advanced Lead & Sales Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <AuthProvider>
          <ThemeProvider>
            <ClientAuthShell>{children}</ClientAuthShell>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
