'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, Acompanhante, Cidade } from '@/lib/api';
import { Button, Card, Badge, Spinner } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

export default function HomePage() {
  const { isAuthenticated, logout } = useAuth();
  const [destaques, setDestaques] = useState<Acompanhante[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [acompanhantesData, cidadesData] = await Promise.all([
          api.acompanhantes.listar({ per_page: 8, ordenar: 'popular' }),
          api.taxonomias.getCidades(),
        ]);
        setDestaques(acompanhantesData.data);
        setCidades(cidadesData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-white">ScortRio</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/acompanhantes" className="text-zinc-400 hover:text-white transition-colors font-medium">
                Acompanhantes
              </Link>
              <Link href="/planos" className="text-zinc-400 hover:text-white transition-colors font-medium">
                Anuncie
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                  <button onClick={logout} className="text-zinc-500 hover:text-white text-sm font-medium transition-colors">
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Entrar</Button>
                  </Link>
                  <Link href="/cadastro">
                    <Button size="sm">Anunciar Grátis</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full mb-8">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            <span className="text-rose-400 text-sm font-medium">+500 Acompanhantes Verificadas</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Encontre Acompanhantes
            <br />
            <span className="bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">
              Verificadas no Rio de Janeiro
            </span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            A plataforma mais segura e discreta para encontrar acompanhantes de luxo 
            com fotos reais e perfis verificados.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/acompanhantes">
              <Button size="lg" className="w-full sm:w-auto">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explorar Acompanhantes
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Quero Anunciar
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16">
            <div className="flex items-center gap-2 text-zinc-500">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">100% Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
              </svg>
              <span className="text-sm">Privacidade Total</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Fotos Verificadas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cidades Section */}
      <section className="py-16 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Acompanhantes por Cidade
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Encontre acompanhantes verificadas nas principais cidades do Rio de Janeiro e região
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {cidades.slice(0, 12).map(cidade => (
              <Link 
                key={cidade.id} 
                href={`/acompanhantes/${cidade.slug}`}
                className="group"
              >
                <Card hover className="p-4 text-center">
                  <div className="text-2xl mb-2">📍</div>
                  <p className="font-medium text-white group-hover:text-rose-400 transition-colors">
                    {cidade.nome}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">{cidade.count || 0} perfis</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Destaques Section */}
      <section className="py-20 bg-[#0c0c0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Acompanhantes em Destaque
              </h2>
              <p className="text-zinc-400">Os perfis mais populares da plataforma</p>
            </div>
            <Link href="/acompanhantes">
              <Button variant="outline">Ver Todas</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {destaques.map((acompanhante, index) => (
                <ProfileCard 
                  key={acompanhante.id} 
                  acompanhante={acompanhante}
                  featured={index < 2}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Encontre sua companhia ideal em apenas 3 passos simples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '🔍',
                title: 'Pesquise',
                description: 'Explore perfis verificados com filtros avançados por cidade, características e preferências.'
              },
              {
                step: '02',
                icon: '💬',
                title: 'Conecte-se',
                description: 'Entre em contato direto com a acompanhante escolhida via WhatsApp ou telefone.'
              },
              {
                step: '03',
                icon: '✨',
                title: 'Aproveite',
                description: 'Agende seu encontro com total privacidade, segurança e discrição.'
              }
            ].map((item, index) => (
              <Card key={index} className="p-8 text-center relative overflow-hidden group" hover>
                <div className="absolute top-4 right-4 text-5xl font-bold text-zinc-800/50 group-hover:text-rose-500/20 transition-colors">
                  {item.step}
                </div>
                <div className="text-5xl mb-6">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-zinc-400">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Anunciar */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-purple-500/10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
            <span className="text-amber-400 text-sm font-medium">👑 Cadastro Gratuito</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Quer Anunciar Seus Serviços?
          </h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Cadastre-se gratuitamente e alcance milhares de clientes qualificados. 
            Aumente sua visibilidade com nossos planos premium.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/cadastro">
              <Button size="lg">
                Criar Minha Conta Grátis
              </Button>
            </Link>
            <Link href="/planos">
              <Button variant="outline" size="lg">
                Ver Planos Premium
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-zinc-500">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Sem mensalidade no plano básico
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Contato direto com clientes
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Suporte dedicado
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-12 bg-[#050506]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="text-lg font-bold text-white">ScortRio</span>
              </Link>
              <p className="text-sm text-zinc-500">
                A plataforma mais segura para encontrar acompanhantes verificadas.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Navegação</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/acompanhantes" className="text-zinc-400 hover:text-white transition-colors">Acompanhantes</Link></li>
                <li><Link href="/planos" className="text-zinc-400 hover:text-white transition-colors">Planos</Link></li>
                <li><Link href="/cadastro" className="text-zinc-400 hover:text-white transition-colors">Anunciar</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800 mt-12 pt-8 text-center">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} ScortRio. Todos os direitos reservados.
            </p>
            <p className="text-xs text-zinc-600 mt-2">
              Este site é destinado apenas para maiores de 18 anos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Profile Card Component
function ProfileCard({ acompanhante, featured = false }: { acompanhante: Acompanhante; featured?: boolean }) {
  return (
    <Link href={`/acompanhante/${acompanhante.slug}`}>
      <Card 
        hover 
        glow={featured ? 'pink' : 'none'} 
        className={`overflow-hidden group ${featured ? 'ring-1 ring-rose-500/30' : ''}`}
      >
        <div className="relative aspect-[3/4]">
          <img
            src={acompanhante.foto_principal || '/placeholder.jpg'}
            alt={acompanhante.nome}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {acompanhante.plano === 'vip' && (
              <Badge variant="vip">👑 VIP</Badge>
            )}
            {acompanhante.plano === 'premium' && (
              <Badge variant="premium">⭐ Premium</Badge>
            )}
            {acompanhante.verificada && (
              <Badge variant="success">✓ Verificada</Badge>
            )}
          </div>

          {/* Online Badge */}
          {acompanhante.online && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1.5 bg-emerald-500/90 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Online
              </span>
            </div>
          )}

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white mb-1">
              {acompanhante.nome}, {acompanhante.idade}
            </h3>
            <p className="text-sm text-zinc-300 mb-2">
              📍 {acompanhante.bairro}, {acompanhante.cidade}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-rose-400">
                {formatCurrency(acompanhante.valor_hora)}
                <span className="text-sm text-zinc-400 font-normal">/h</span>
              </p>
              <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                Ver Perfil
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
