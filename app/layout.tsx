import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Changing to Inter as requested "Premium design"
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" }); // Reusing var name to avoid breaking css

export const metadata: Metadata = {
  title: "Marathon Bib Delivery",
  description: "Fast and reliable bib delivery for marathon runners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
