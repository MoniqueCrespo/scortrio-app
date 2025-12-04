'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, DashboardStats } from '@/lib/api';
import { Button, Card, Badge, Spinner, Alert } from '@/components/ui';

export default function DashboardPage() {
  const { user, token, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadStats = async () => {
      if (!token) return;
      
      try {
        const data = await api.dashboard.getStats(token);
        setStats(data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      loadStats();
    }
  }, [token, authLoading, isAuthenticated, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'publish': return <Badge variant="success">✅ Ativo</Badge>;
      case 'pending': return <Badge variant="warning">⏳ Em análise</Badge>;
      case 'draft': return <Badge variant="danger">❌ Reprovado</Badge>;
      default: return <Badge>Desconhecido</Badge>;
    }
  };

  const getPlanoBadge = (plano: string | undefined) => {
    switch (plano) {
      case 'vip': return <Badge variant="vip">👑 VIP</Badge>;
      case 'premium': return <Badge variant="premium">⭐ Premium</Badge>;
      default: return <Badge>🆓 Gratuito</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-pink-600">ScortRio</Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Olá, {user?.nome}</span>
              <button onClick={logout} className="text-gray-500 hover:text-gray-700">Sair</button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
              <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-pink-50 text-pink-600 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link href="/meu-perfil" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Meu Perfil
              </Link>
              <Link href="/minhas-fotos" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Minhas Fotos
              </Link>
              <Link href="/planos" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Planos
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Alertas */}
            {!stats?.tem_perfil && (
              <Alert variant="warning" className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <span>Você ainda não criou seu perfil. Crie agora para aparecer no site!</span>
                  <Link href="/meu-perfil"><Button size="sm">Criar Perfil</Button></Link>
                </div>
              </Alert>
            )}

            {stats?.perfil_status === 'pending' && (
              <Alert variant="info" className="mb-6">
                Seu perfil está em análise. Você será notificada quando for aprovado.
              </Alert>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">Acompanhe suas estatísticas</p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(stats?.perfil_status)}
                {getPlanoBadge(stats?.plano)}
              </div>
            </div>

            {/* Stats Grid */}
            {stats?.tem_perfil && stats.stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Visualizações</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.stats.views.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cliques WhatsApp</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.stats.whatsapp_clicks.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cliques Telefone</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.stats.phone_clicks.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Favoritos</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.stats.favoritos.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Plano Info */}
            {stats?.tem_perfil && (
              <Card className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Seu Plano</h3>
                    <p className="text-gray-600">
                      {stats.plano === 'free' 
                        ? 'Você está no plano gratuito. Faça upgrade para mais destaque!'
                        : (stats.dias_restantes ?? 0) > 0
                          ? `${stats.dias_restantes} dias restantes`
                          : 'Seu plano expirou'}
                    </p>
                  </div>
                  <Link href="/planos">
                    <Button variant={stats.plano === 'free' ? 'primary' : 'outline'}>
                      {stats.plano === 'free' ? 'Fazer Upgrade' : 'Renovar Plano'}
                    </Button>
                  </Link>
                </div>
              </Card>
            )}

            {/* Taxa de Conversão */}
            {stats?.tem_perfil && stats.stats && stats.stats.views > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Taxa de Conversão</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                        style={{ width: `${Math.min(stats.stats.taxa_conversao, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stats.stats.taxa_conversao}%</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Porcentagem de visitantes que clicaram no WhatsApp ou Telefone
                </p>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
