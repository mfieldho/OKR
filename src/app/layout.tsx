import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { OKRProvider } from '@/contexts/OKRContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { OKRViewProvider } from '@/contexts/OKRViewContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'Form3 OKR Platform',
  description: 'Company-wide OKR dashboard and modelling platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="h-full flex antialiased">
        <AuthProvider>
          <SettingsProvider>
            <OKRProvider>
              <OKRViewProvider>
                <SidebarProvider>
                  <AuthGuard>
                    <Sidebar />
                    <div className="flex-1 flex flex-col min-h-screen overflow-auto">
                      {children}
                    </div>
                  </AuthGuard>
                </SidebarProvider>
              </OKRViewProvider>
            </OKRProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
