import type { Metadata } from "next";
import { Public_Sans, Merriweather } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { LayoutClient } from "@/components/LayoutClient";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Travel Authorization Registry | Ministry of State',
  description: 'Official travel authorization and document approval system for the Ministry of State.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${publicSans.variable} ${merriweather.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden">
        <AuthProvider>
          <NotificationProvider>
            <LayoutClient>{children}</LayoutClient>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
