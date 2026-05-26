import type { Metadata } from "next";
import { Noto_Serif_JP, Inter } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-noto-serif-jp",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AxeForm — Build Beautiful Forms, Effortlessly",
    template: "%s | AxeForm",
  },
  description:
    "Build powerful forms, collect meaningful data, and navigate your insights — a modern, feature-rich form builder SaaS.",
  keywords: ["form builder", "surveys", "polls", "AxeForm", "forms"],
  icons: {
    icon: "/axeform-logo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${notoSerifJP.variable} ${inter.variable} antialiased`}>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
