import Script from "next/script";
import "./globals.css";
import AuthProvider from "@/core/auth/provider/AuthProvider";
import { QueryProvider } from "@/core/query/QueryProvider";
import { ToastProvider } from "@/components/shared/ui/ToastContext";
import { EmpresaThemeProvider } from "@/core/theme/EmpresaThemeProvider";
import { getEmpresaFaviconBootstrapScript } from "@/core/theme/apply-empresa-favicon";

export const metadata = {
  title: "Codiesel - Dashboard",
  description: "Panel administrativo profesional",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
        <Script
          id="empresa-favicon-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: getEmpresaFaviconBootstrapScript() }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            <EmpresaThemeProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </EmpresaThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
