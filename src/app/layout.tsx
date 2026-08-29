import type { Metadata } from "next";

import "7.css/dist/7.css";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          overflow: "hidden",
          fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
          fontSize: "12px",
        }}
      >
        {children}
      </body>
    </html>
  );
}
