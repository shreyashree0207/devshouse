import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "Sustainify | Radical Transparency for Social Impact",
  description: "Track every rupee of your donation with AI-verified proof and real-time milestone tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#0a0f0a] text-[#f8fafc] font-jakarta">
        {/* Animated Neon Background */}
        <div className="neon-bg">
          <div className="neon-blob neon-blob-1" />
          <div className="neon-blob neon-blob-2" />
          <div className="neon-blob neon-blob-3" />
        </div>
        
        {/* Floating Particles */}
        <div className="particle-container">
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
        </div>

        <Navbar />
        <main className="min-h-screen relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
