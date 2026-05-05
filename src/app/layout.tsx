import { Outfit } from 'next/font/google';
import './globals.css';

import { AuthProvider } from '@/context/AuthContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { CashProvider } from '@/context/CashContext';
import { ToastProvider } from '@/context/ToastContext';
import { ConfirmProvider } from '@/context/ConfirmContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  title: {
    template: "%s | Gustitos del Virrey",
    default: "Gustitos del Virrey - Sistema de Gestión",
  },
  description: "Sistema inteligente para la gestión de creperías, inventario y ventas.",
  icons: {
    icon: "/images/logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <AuthProvider>
            <ConfirmProvider>
              <ToastProvider>
                <CashProvider>
                  <SidebarProvider>{children}</SidebarProvider>
                </CashProvider>
              </ToastProvider>
            </ConfirmProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
