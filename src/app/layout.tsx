import type { Metadata } from "next";
import { Cinzel, Montserrat } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RIHU Perfume | A Fragrance of Elegance & Timeless Luxury",
  description: "RIHU Perfume is designed for those who want their fragrance to speak before they do. Experience luxurious, long-lasting, and elegant Eau De Parfum crafted for confident personalities. Explore our signature collection today.",
  keywords: ["RIHU Perfume", "Premium Luxury Fragrance", "Long Lasting Scent", "Eau De Parfum", "Dubai Luxury Scent", "Signature Collection", "RIHU Classic", "RIHU Noir", "RIHU Gold"],
  openGraph: {
    title: "RIHU Perfume | A Fragrance of Elegance & Timeless Luxury",
    description: "Experience luxurious, long-lasting, and elegant Eau De Parfum crafted for confident personalities.",
    url: "https://rihuperfume.com",
    siteName: "RIHU Perfume",
    images: [
      {
        url: "/images/rihu_perfume_hero.png",
        width: 1200,
        height: 1200,
        alt: "RIHU Signature Perfume",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${montserrat.variable} h-full scroll-smooth antialiased`}
    >
      <body className="bg-[#030303] text-[#e6dfd3] min-h-full flex flex-col font-sans selection:bg-[#c5a059] selection:text-black">
        {children}
      </body>
    </html>
  );
}
