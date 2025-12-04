'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api, Acompanhante, Cidade, Categoria } from '@/lib/api';
import { Spinner } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

interface Props {
  initialCidade?: string;
  initialCategoria?: string;
  cidadeFromUrl?: boolean;
}

export default function AcompanhantesClient({ initialCidade, initialCategoria }: Props) {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  
  const [acompanhantes, setAcompanhantes] = useState<Acompanhante[]>([]);
  const [destaques, setDestaques] = useState<Acompanhante[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('mulheres');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    cidade: initialCidade || '',
    categoria: initialCategoria || '',
    preco_min: '',
    preco_max: '',
    verificada: false,
    online: false,
    ordenar: 'recentes' as const,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [cidadesData, categoriasData, destaquesData] = await Promise.all([
          api.taxonomias.getCidades(),
          api.taxonomias.getCategorias(),
          api.acompanhantes.listar({ per_page: 10, ordenar: 'popular' }),
        ]);
        setCidades(cidadesData);
        setCategorias(categoriasData);
        setDestaques(destaquesData.data);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const loadAcompanhantes = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { page, per_page: 12, ordenar: filters.ordenar };
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
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [page, filters]);

  useEffect(() => { loadAcompanhantes(); }, [loadAcompanhantes]);

  const handleFilter = (name: string, value: any) => {
    if (name === 'cidade') {
      router.push(value ? `/acompanhantes/${value}` : '/acompanhantes');
      return;
    }
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const clearFilters = () => router.push('/acompanhantes');

  const cidadeNome = filters.cidade 
    ? cidades.find(c => c.slug === filters.cidade)?.nome || filters.cidade.replace(/-/g, ' ')
    : 'Todo Brasil';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-800">ScortRio</span>
          </Link>

          <div className="hidden md:block flex-1 max-w-md mx-8">
            <select
              value={filters.cidade}
              onChange={(e) => handleFilter('cidade', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm"
            >
              <option value="">🔍 Buscar cidade</option>
              {cidades.map(c => <option key={c.id} value={c.slug}>{c.nome}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 font-medium">Dashboard</Link>
                <button onClick={logout} className="text-gray-500 text-sm">Sair</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 font-medium">Entrar</Link>
                <Link href="/cadastro" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-full font-semibold text-sm shadow-lg">
                  Cadastre-se GRÁTIS
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Destaques Carousel */}
      {destaques.length > 0 && (
        <div className="bg-gray-50 border-b py-4">
          <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto scrollbar-hide">
            {destaques.map(a => (
              <Link key={a.id} href={`/acompanhante/${a.slug}`} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-orange-500 ring-offset-2">
                  <img src={a.foto_principal || '/placeholder.jpg'} alt={a.nome} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs text-gray-600 font-medium">{a.nome.split(' ')[0]}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
          {['mulheres', 'homens', 'trans'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab === 'mulheres' ? '♀ Mulheres' : tab === 'homens' ? '♂ Homens' : '⚧ Trans'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Acompanhantes em {cidadeNome}</h1>
            <p className="text-gray-500 text-sm">{total} resultados</p>
          </div>
          <div className="flex gap-3">
            <select value={filters.ordenar} onChange={(e) => handleFilter('ordenar', e.target.value)} className="px-4 py-2 border rounded-lg text-sm">
              <option value="recentes">Mais recentes</option>
              <option value="popular">Mais populares</option>
              <option value="preco_asc">Menor preço</option>
              <option value="preco_desc">Maior preço</option>
            </select>
            <button onClick={() => setShowFilters(!showFilters)} className="px-4 py-2 border rounded-lg text-sm flex items-center gap-2">
              ⚙️ Filtrar
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <select value={filters.categoria} onChange={(e) => handleFilter('categoria', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Todas</option>
                {categorias.map(c => <option key={c.id} value={c.slug}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Preço Min</label>
              <input type="number" placeholder="R$" value={filters.preco_min} onChange={(e) => handleFilter('preco_min', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Preço Max</label>
              <input type="number" placeholder="R$" value={filters.preco_max} onChange={(e) => handleFilter('preco_max', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex flex-col justify-end gap-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={filters.verificada} onChange={(e) => handleFilter('verificada', e.target.checked)} /> Verificadas</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={filters.online} onChange={(e) => handleFilter('online', e.target.checked)} /> Online</label>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : acompanhantes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="text-xl font-semibold mb-2">Nenhum resultado</h3>
            <button onClick={clearFilters} className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-full font-semibold">Limpar filtros</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {acompanhantes.map(a => <ProfileCard key={a.id} data={a} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-12">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50">← Anterior</button>
            <span className="px-4 py-2">Página {page} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50">Próxima →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileCard({ data: a }: { data: Acompanhante }) {
  const isTop = a.plano === 'vip' || a.plano === 'premium';
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl transition-all group">
      <Link href={`/acompanhante/${a.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden">
          <img src={a.foto_principal || '/placeholder.jpg'} alt={a.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {isTop && (
            <div className="absolute top-3 left-3">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                {a.plano === 'vip' ? '👑 Top modelo' : '⭐ Destaque'}
              </span>
            </div>
          )}
          {a.online && (
            <div className="absolute top-3 right-3">
              <span className="bg-white/90 text-green-600 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
              </span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/acompanhante/${a.slug}`}>
          <h3 className="font-bold text-gray-800 text-lg hover:text-orange-500">
            {a.nome} {a.verificada && <span className="text-green-500">✓</span>}
          </h3>
        </Link>
        {a.headline && <p className="text-gray-500 text-sm italic mt-1 line-clamp-2">"{a.headline}"</p>}
        <div className="mt-3">
          <span className="text-orange-500 font-bold text-xl">{formatCurrency(a.valor_hora)}</span>
          <span className="text-gray-400 text-sm">/h</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-500">
          <span>⭐ {a.avaliacoes || 0} notas</span>
          <span>🎂 {a.idade} anos</span>
          <span>📷 {a.total_fotos || 0} fotos</span>
          <span>📍 {a.atende_local ? 'Com local' : 'Sem local'}</span>
        </div>
        <p className="text-sm text-gray-600 mt-3">📍 {a.bairro ? `${a.bairro} - ` : ''}{a.cidade}</p>
        <Link href={`/acompanhante/${a.slug}`}>
          <button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 shadow-lg">
            Entrar em contato
          </button>
        </Link>
      </div>
    </div>
  );
}
