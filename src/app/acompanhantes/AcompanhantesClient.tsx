'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, Acompanhante, Cidade, Categoria } from '@/lib/api';
import { Button, Card, Badge, Spinner } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

interface AcompanhantesClientProps {
  initialCidade?: string;
  initialCategoria?: string;
}

export default function AcompanhantesClient({ initialCidade, initialCategoria }: AcompanhantesClientProps) {
  const { isAuthenticated, logout } = useAuth();
  
  const [acompanhantes, setAcompanhantes] = useState<Acompanhante[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    cidade: initialCidade || '',
    categoria: initialCategoria || '',
    preco_min: '',
    preco_max: '',
    verificada: false,
    online: false,
    ordenar: 'recentes' as 'recentes' | 'preco_asc' | 'preco_desc' | 'popular',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadTaxonomias = async () => {
      try {
        const [cidadesData, categoriasData] = await Promise.all([
          api.taxonomias.getCidades(),
          api.taxonomias.getCategorias(),
        ]);
        setCidades(cidadesData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Erro ao carregar taxonomias:', error);
      }
    };
    loadTaxonomias();
  }, []);

  const loadAcompanhantes = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        per_page: 12,
        ordenar: filters.ordenar,
      };

      if (filters.cidade) params.cidade = filters.cidade;
      if (filters.categoria) params.categoria = filters.categoria;
      if (filters.preco_min) params.preco_min = parseInt(filters.preco_min);
      if (filters.preco_max) params.preco_max = parseInt(filters.preco_max);
      if (filters.verificada) params.verificada = true;
      if (filters.online) params.online = true;

      const data = await api.acompanhantes.listar(params);
      setAcompanhantes(data.data);
      setTotal(data.total);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Erro ao carregar acompanhantes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadAcompanhantes();
  }, [loadAcompanhantes]);

  const handleFilterChange = (name: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      cidade: '',
      categoria: '',
      preco_min: '',
      preco_max: '',
      verificada: false,
      online: false,
      ordenar: 'recentes',
    });
    setPage(1);
  };

  const cidadeNome = filters.cidade 
    ? cidades.find(c => c.slug === filters.cidade)?.nome || filters.cidade
    : 'Todas as Cidades';

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
              <Link href="/acompanhantes" className="text-rose-400 font-medium">
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
                  <button onClick={logout} className="text-zinc-500 hover:text-white text-sm font-medium">
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Entrar</Button>
                  </Link>
                  <Link href="/cadastro">
                    <Button size="sm">Anunciar</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Acompanhantes em {cidadeNome}
            </h1>
            <p className="text-zinc-400">
              {total} resultados encontrados
            </p>
          </div>

          {/* Filters Bar */}
          <div className="bg-[#0f0f12] border border-zinc-800 rounded-2xl p-4 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              {/* Cidade */}
              <div className="flex-1 min-w-[180px]">
                <select
                  value={filters.cidade}
                  onChange={(e) => handleFilterChange('cidade', e.target.value)}
                  className="w-full px-4 py-3 bg-[#18181c] border border-zinc-700 rounded-xl text-white text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                >
                  <option value="">Todas as cidades</option>
                  {cidades.map(cidade => (
                    <option key={cidade.id} value={cidade.slug}>{cidade.nome}</option>
                  ))}
                </select>
              </div>

              {/* Categoria */}
              <div className="flex-1 min-w-[180px]">
                <select
                  value={filters.categoria}
                  onChange={(e) => handleFilterChange('categoria', e.target.value)}
                  className="w-full px-4 py-3 bg-[#18181c] border border-zinc-700 rounded-xl text-white text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              {/* Ordenar */}
              <div className="flex-1 min-w-[180px]">
                <select
                  value={filters.ordenar}
                  onChange={(e) => handleFilterChange('ordenar', e.target.value)}
                  className="w-full px-4 py-3 bg-[#18181c] border border-zinc-700 rounded-xl text-white text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                >
                  <option value="recentes">Mais recentes</option>
                  <option value="popular">Mais populares</option>
                  <option value="preco_asc">Menor preço</option>
                  <option value="preco_desc">Maior preço</option>
                </select>
              </div>

              {/* Toggle Filtros Avançados */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
              </Button>

              {/* Limpar */}
              <button 
                onClick={clearFilters}
                className="text-rose-400 hover:text-rose-300 text-sm font-medium transition-colors"
              >
                Limpar
              </button>
            </div>

            {/* Filtros Avançados */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-wrap items-center gap-6">
                {/* Preço */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">Preço:</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.preco_min}
                    onChange={(e) => handleFilterChange('preco_min', e.target.value)}
                    className="w-24 px-3 py-2 bg-[#18181c] border border-zinc-700 rounded-lg text-white text-sm"
                  />
                  <span className="text-zinc-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.preco_max}
                    onChange={(e) => handleFilterChange('preco_max', e.target.value)}
                    className="w-24 px-3 py-2 bg-[#18181c] border border-zinc-700 rounded-lg text-white text-sm"
                  />
                </div>

                {/* Checkboxes */}
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.verificada}
                    onChange={(e) => handleFilterChange('verificada', e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-rose-500 focus:ring-rose-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                    Apenas verificadas
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.online}
                    onChange={(e) => handleFilterChange('online', e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-rose-500 focus:ring-rose-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                    Online agora
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : acompanhantes.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-zinc-400 mb-6">
                Tente ajustar os filtros ou limpar a pesquisa
              </p>
              <Button onClick={clearFilters}>Limpar Filtros</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {acompanhantes.map((acompanhante) => (
                  <ProfileCard key={acompanhante.id} acompanhante={acompanhante} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ← Anterior
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl font-medium transition-all ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Próxima →
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Profile Card Component
function ProfileCard({ acompanhante }: { acompanhante: Acompanhante }) {
  return (
    <Link href={`/acompanhante/${acompanhante.slug}`}>
      <Card hover glow="pink" className="overflow-hidden group">
        <div className="relative aspect-[3/4]">
          <img
            src={acompanhante.foto_principal || '/placeholder.jpg'}
            alt={acompanhante.nome}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          
          {/* Badges */}
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

          {/* Online */}
          {acompanhante.online && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1.5 bg-emerald-500/90 text-white text-xs px-2.5 py-1 rounded-full">
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
            <p className="text-xl font-bold text-rose-400">
              {formatCurrency(acompanhante.valor_hora)}
              <span className="text-sm text-zinc-400 font-normal">/h</span>
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
