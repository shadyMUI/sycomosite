import type { Metadata } from "next";
import { Manrope, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import IntroCurtain from "@/components/IntroCurtain";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sycomo Digital",
  description:
    "Sycomo Digital — studio digitale indipendente. Costruiamo prodotti web e app su misura.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${manrope.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <IntroCurtain />
        {children}
      </body>
    </html>
  );
}
