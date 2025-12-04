import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AcompanhantesClient from '../AcompanhantesClient';

// Lista de cidades válidas (pode vir da API no futuro)
const cidadesValidas = [
  'rio-de-janeiro', 'sao-paulo', 'belo-horizonte', 'brasilia', 'salvador',
  'fortaleza', 'curitiba', 'recife', 'porto-alegre', 'manaus', 'goiania',
  'belem', 'guarulhos', 'campinas', 'sao-luis', 'maceio', 'natal', 'teresina',
  'campo-grande', 'joao-pessoa', 'aracaju', 'cuiaba', 'porto-velho', 'macapa',
  'florianopolis', 'vitoria', 'niteroi', 'santos', 'uberlandia', 'sorocaba',
  'ribeirao-preto', 'contagem', 'aracatuba', 'feira-de-santana', 'juiz-de-fora',
  'joinville', 'londrina', 'aparecida-de-goiania', 'ananindeua', 'serra',
  'caxias-do-sul', 'duque-de-caxias', 'sao-bernardo-do-campo', 'nova-iguacu',
  'copacabana', 'ipanema', 'leblon', 'barra-da-tijuca', 'centro', 'botafogo',
  'zona-sul', 'zona-norte', 'zona-oeste'
];

// Formata slug para nome legível
function formatCidadeNome(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Gerar páginas estáticas para as principais cidades
export async function generateStaticParams() {
  return cidadesValidas.slice(0, 20).map((cidade) => ({
    cidade,
  }));
}

// Metadata dinâmica baseada na cidade
export async function generateMetadata({ 
  params 
}: { 
  params: { cidade: string } 
}): Promise<Metadata> {
  const cidadeNome = formatCidadeNome(params.cidade);
  
  const title = `Acompanhantes em ${cidadeNome} | ScortRio`;
  const description = `Encontre acompanhantes verificadas em ${cidadeNome}. Perfis com fotos reais, preços e contato direto. As melhores acompanhantes de ${cidadeNome} estão aqui.`;
  
  return {
    title,
    description,
    keywords: `acompanhantes ${cidadeNome.toLowerCase()}, garotas de programa ${cidadeNome.toLowerCase()}, escorts ${cidadeNome.toLowerCase()}, acompanhantes de luxo ${cidadeNome.toLowerCase()}`,
    openGraph: {
      title,
      description,
      locale: 'pt_BR',
      type: 'website',
      url: `https://scortrio.com/acompanhantes/${params.cidade}`,
    },
    alternates: {
      canonical: `https://scortrio.com/acompanhantes/${params.cidade}`,
    },
  };
}

export default function AcompanhantesCidadePage({ 
  params,
  searchParams
}: { 
  params: { cidade: string };
  searchParams: { categoria?: string };
}) {
  // Valida se a cidade existe (opcional - pode remover para aceitar qualquer slug)
  // if (!cidadesValidas.includes(params.cidade)) {
  //   notFound();
  // }

  return (
    <AcompanhantesClient 
      initialCidade={params.cidade} 
      initialCategoria={searchParams.categoria}
      cidadeFromUrl={true}
    />
  );
}
