import "./globals.css";

export const metadata = {
  title: "Quản lý chi tiêu",
  description: "Ứng dụng quản lý thu chi cá nhân"
};

export const viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
