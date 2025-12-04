'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, Acompanhante, Cidade } from '@/lib/api';
import { Button, Badge, Spinner } from '@/components/ui';
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-800">ScortRio</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/acompanhantes" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">
                Acompanhantes
              </Link>
              <Link href="/planos" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">
                Anuncie
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                  <button onClick={logout} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                    Entrar
                  </Link>
                  <Link href="/cadastro">
                    <Button size="sm">Cadastre-se GRÁTIS</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Encontre Acompanhantes
            <br />
            <span className="text-orange-500">Verificadas</span> em Todo o
            <br />
            <span className="text-orange-500">Brasil</span> com Segurança
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            A plataforma mais segura e discreta para encontrar acompanhantes 
            com fotos reais e perfis verificados.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl shadow-xl border border-gray-100">
              <select className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-0 text-gray-700 focus:ring-2 focus:ring-orange-500">
                <option value="">Selecione a cidade</option>
                {cidades.map(cidade => (
                  <option key={cidade.id} value={cidade.slug}>{cidade.nome}</option>
                ))}
              </select>
              <Link href="/acompanhantes" className="sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  🔍 Buscar Acompanhantes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
            Como Encontrar Acompanhantes Verificadas na ScortRio
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Encontre sua companhia ideal em 3 passos:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔍',
                title: 'Pesquise',
                desc: 'Escolha cidade, preferências e veja os perfis.',
              },
              {
                icon: '💬',
                title: 'Conecte-se',
                desc: 'Entre em contato direto com a acompanhante escolhida',
              },
              {
                icon: '✨',
                title: 'Aproveite!',
                desc: 'Agende seu encontro com privacidade e segurança.',
              },
            ].map((step, i) => (
              <div key={i} className="text-center p-8 bg-gray-50 rounded-2xl hover:bg-orange-50 transition-colors">
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
            Acompanhantes para Todos os Gostos
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Encontre perfis variados com filtros avançados e descubra acompanhantes com estilos, características e preferências que combinam com você.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link href="/acompanhantes" className="group">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-orange-300 hover:shadow-lg transition-all">
                <div className="text-5xl mb-4">👩</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
                  Acompanhantes Femininas
                </h3>
                <p className="text-gray-600">
                  Encontre mulheres para encontros individuais, a dois, em grupo ou eventos especiais.
                </p>
              </div>
            </Link>

            <Link href="/acompanhantes" className="group">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-orange-300 hover:shadow-lg transition-all">
                <div className="text-5xl mb-4">👨</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
                  Acompanhantes Masculinos
                </h3>
                <p className="text-gray-600">
                  Perfis de homens para serviços com opções ativas, passivas ou versáteis.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
            Acompanhantes nas Principais Cidades
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Encontre acompanhantes verificadas nas principais cidades do Brasil
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {cidades.slice(0, 12).map(cidade => (
              <Link 
                key={cidade.id} 
                href={`/acompanhantes/${cidade.slug}`}
                className="group"
              >
                <div className="bg-gray-50 hover:bg-orange-50 rounded-xl p-4 text-center transition-all hover:shadow-md border border-transparent hover:border-orange-200">
                  <p className="font-medium text-gray-800 group-hover:text-orange-500 transition-colors">
                    {cidade.nome}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{cidade.count || 0} perfis</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/acompanhantes">
              <Button variant="outline">Ver todas as cidades</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Profiles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Acompanhantes em Destaque
              </h2>
              <p className="text-gray-600">Os perfis mais populares da plataforma</p>
            </div>
            <Link href="/acompanhantes">
              <Button variant="outline">Ver Todas</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {destaques.map((acompanhante, index) => (
                <ProfileCard key={acompanhante.id} acompanhante={acompanhante} isTop={index < 2} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Quer Anunciar Seus Serviços?
          </h2>
          <p className="text-xl opacity-90 mb-10">
            Cadastre-se gratuitamente e alcance milhares de clientes qualificados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro">
              <Button variant="secondary" size="lg" className="bg-white text-orange-500 hover:bg-gray-100">
                Criar Minha Conta Grátis
              </Button>
            </Link>
            <Link href="/planos">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Ver Planos Premium
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="text-lg font-bold text-white">ScortRio</span>
              </Link>
              <p className="text-sm">
                A plataforma mais segura para encontrar acompanhantes verificadas.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Navegação</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/acompanhantes" className="hover:text-orange-500 transition-colors">Acompanhantes</Link></li>
                <li><Link href="/planos" className="hover:text-orange-500 transition-colors">Planos</Link></li>
                <li><Link href="/cadastro" className="hover:text-orange-500 transition-colors">Anunciar</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-sm">
              © {new Date().getFullYear()} ScortRio. Todos os direitos reservados.
            </p>
            <p className="text-xs mt-2 text-gray-500">
              Este site é destinado apenas para maiores de 18 anos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Profile Card Component
function ProfileCard({ acompanhante, isTop = false }: { acompanhante: Acompanhante; isTop?: boolean }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100">
      <div className="relative">
        <Link href={`/acompanhante/${acompanhante.slug}`}>
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={acompanhante.foto_principal || '/placeholder.jpg'}
              alt={acompanhante.nome}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </Link>
        
        {isTop && (
          <div className="absolute top-3 left-3">
            <Badge variant="vip">⭐ Top modelo</Badge>
          </div>
        )}

        <div className="absolute bottom-3 left-3 flex gap-1">
          {[1,2,3,4,5].map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-orange-500' : 'bg-white/60'}`} />
          ))}
        </div>
      </div>

      <div className="p-4">
        <Link href={`/acompanhante/${acompanhante.slug}`}>
          <h3 className="font-bold text-gray-800 text-lg hover:text-orange-500 transition-colors">
            {acompanhante.nome}
          </h3>
        </Link>
        
        <p className="text-gray-500 text-sm mb-2 line-clamp-1">
          "{acompanhante.headline || 'Disponível para você'}"
        </p>

        <p className="text-orange-500 font-bold text-xl mb-3">
          {formatCurrency(acompanhante.valor_hora)}/h
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
          <span>🎂 {acompanhante.idade} anos</span>
          <span>📍 {acompanhante.cidade}</span>
        </div>

        <Link href={`/acompanhante/${acompanhante.slug}`}>
          <button className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors text-sm">
            Entrar em contato
          </button>
        </Link>
      </div>
    </div>
  );
}
