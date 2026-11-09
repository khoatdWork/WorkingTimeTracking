import type { Metadata, Viewport } from "next";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "Đủ giờ · Sổ thời gian làm việc",
  description: "Chấm công, theo dõi WFH và cân đối đủ giờ làm việc mỗi tháng.",
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/manifest.webmanifest`,
  applicationName: "Đủ giờ",
  appleWebApp: { capable: true, title: "Đủ giờ", statusBarStyle: "default" },
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icon.svg`,
    apple: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icons/apple-touch-icon.png`,
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2257c7",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
