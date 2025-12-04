import { Metadata } from 'next';
import AcompanhantesClient from './AcompanhantesClient';

// Metadata dinâmica baseada nos searchParams
export async function generateMetadata({ 
  searchParams 
}: { 
  searchParams: { cidade?: string; categoria?: string } 
}): Promise<Metadata> {
  const cidade = searchParams.cidade;
  const categoria = searchParams.categoria;
  
  // Formata nome da cidade
  const cidadeFormatada = cidade 
    ? cidade.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Rio de Janeiro';
  
  // Formata nome da categoria
  const categoriaFormatada = categoria
    ? categoria.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : '';
  
  const titleParts = ['Acompanhantes'];
  if (categoriaFormatada) titleParts.push(categoriaFormatada);
  titleParts.push(`em ${cidadeFormatada}`);
  titleParts.push('| ScortRio');
  
  const title = titleParts.join(' ');
  const description = `Encontre acompanhantes${categoriaFormatada ? ` ${categoriaFormatada.toLowerCase()}` : ''} verificadas em ${cidadeFormatada}. Perfis com fotos reais, preços e contato direto.`;
  
  return {
    title,
    description,
    keywords: `acompanhantes ${cidadeFormatada.toLowerCase()}, garotas de programa ${cidadeFormatada.toLowerCase()}, escorts ${cidadeFormatada.toLowerCase()}${categoriaFormatada ? `, ${categoriaFormatada.toLowerCase()}` : ''}`,
    openGraph: {
      title,
      description,
      locale: 'pt_BR',
      type: 'website',
    },
  };
}

export default function AcompanhantesPage({ 
  searchParams 
}: { 
  searchParams: { cidade?: string; categoria?: string } 
}) {
  return <AcompanhantesClient initialCidade={searchParams.cidade} initialCategoria={searchParams.categoria} />;
}
