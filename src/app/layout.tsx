import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Codigo Frontend Assessment",
  description: "Animated landing page and team management application.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
