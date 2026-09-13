import type { Metadata } from "next";
import { Baloo_2, Inter } from "next/font/google";
import "./globals.scss";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Codigo Frontend Assessment",
  description: "Animated landing page and team management application.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${baloo.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
