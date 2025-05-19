import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { ConfigProvider } from 'antd';
import trTR from 'antd/locale/tr_TR';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Filo Yönetim Sistemi',
  description: 'Araç filo yönetim sistemi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <ConfigProvider locale={trTR}>
          <AuthProvider>{children}</AuthProvider>
        </ConfigProvider>
      </body>
    </html>
  );
} 