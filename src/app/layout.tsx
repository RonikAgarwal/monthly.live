import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "MONTHLY.LIVE",
  description: "one room. one signal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="crt-flicker"
        style={{
          background: "#000",
          color: "#b0b0b0",
          fontFamily: '"Courier New", "Lucida Console", Monaco, monospace',
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        {/* CRT scanlines */}
        <div className="crt-overlay" />
        {/* CRT vignette */}
        <div className="crt-vignette" />
      </body>
    </html>
  );
}
