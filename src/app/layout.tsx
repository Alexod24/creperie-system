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
