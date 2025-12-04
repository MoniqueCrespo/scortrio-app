import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AcompanhantesClient from './AcompanhantesClient';

// Metadata para a página geral (sem cidade específica)
export const metadata: Metadata = {
  title: 'Acompanhantes | ScortRio',
  description: 'Encontre acompanhantes verificadas em todo o Brasil. Perfis com fotos reais, preços e contato direto.',
  keywords: 'acompanhantes, garotas de programa, escorts, acompanhantes de luxo, acompanhantes verificadas',
  openGraph: {
    title: 'Acompanhantes | ScortRio',
    description: 'Encontre acompanhantes verificadas em todo o Brasil.',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function AcompanhantesPage({ 
  searchParams 
}: { 
  searchParams: { cidade?: string; categoria?: string } 
}) {
  // Se tem cidade nos searchParams, redireciona para URL amigável
  if (searchParams.cidade) {
    const categoria = searchParams.categoria ? `?categoria=${searchParams.categoria}` : '';
    redirect(`/acompanhantes/${searchParams.cidade}${categoria}`);
  }

  return <AcompanhantesClient initialCategoria={searchParams.categoria} />;
}
