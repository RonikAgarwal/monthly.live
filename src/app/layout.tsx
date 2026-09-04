import type { Metadata, Viewport } from "next";
import "./globals.css";
import "7.css/dist/7.css";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "MONTHLY.LIVE",
  description: "one room. one signal.",
};

// Width-aware viewport that uses the safe areas on notched phones. No zoom
// restrictions: two-finger pinch stays available, only the automatic zoom on
// small inputs is prevented (inputs are sized >= 16px).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
