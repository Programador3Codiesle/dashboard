import "./globals.css";
import { DashboardLayout } from "@/components/shared/layout/DashboardLayout";

export const metadata = {
  title: "Dashboard",
  description: "Panel administrativo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}