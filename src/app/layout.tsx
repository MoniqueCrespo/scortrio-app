import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'ScortRio - Acompanhantes de Luxo no Rio de Janeiro',
  description: 'Encontre acompanhantes de luxo verificadas no Rio de Janeiro. Perfis com fotos reais, preços e contato direto.',
  keywords: 'acompanhantes, rio de janeiro, garotas de programa, acompanhantes de luxo, escorts',
  robots: 'index, follow',
  openGraph: {
    title: 'ScortRio - Acompanhantes de Luxo',
    description: 'Encontre acompanhantes de luxo verificadas no Rio de Janeiro.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'ScortRio',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
