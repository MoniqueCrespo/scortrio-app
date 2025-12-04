'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, Plano, DashboardStats } from '@/lib/api';
import { Button, Card, Badge, Spinner, Alert } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

export default function PlanosPage() {
  const { user, token, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [planosData, statsData] = await Promise.all([
          api.planos.listar(),
          token ? api.dashboard.getStats(token) : null,
        ]);

        setPlanos(planosData);
        if (statsData) setStats(statsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [token, authLoading, isAuthenticated, router]);

  const handleSelectPlan = async (planoId: string) => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (!stats?.tem_perfil) {
      setError('Você precisa criar seu perfil antes de assinar um plano');
      return;
    }

    if (planoId === 'free') return;

    setProcessingPlan(planoId);
    setError('');

    try {
      const result = await api.planos.criarPagamento(token, planoId);
      
      if (result.init_point) {
        // Redirecionar para o Mercado Pago
        window.location.href = result.init_point;
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar pagamento');
    } finally {
      setProcessingPlan(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-pink-600">ScortRio</Link>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">Dashboard</Link>
                  <button onClick={logout} className="text-gray-500 hover:text-gray-700">Sair</button>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm">Entrar</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Escolha seu Plano</h1>
          <p className="text-xl text-gray-600">Destaque seu perfil e receba mais contatos</p>
        </div>

        {error && (
          <Alert variant="error" className="max-w-lg mx-auto mb-8">{error}</Alert>
        )}

        {stats?.plano && stats.plano !== 'free' && (
          <Alert variant="info" className="max-w-lg mx-auto mb-8">
            Você está no plano <strong>{stats.plano.toUpperCase()}</strong>
            {(stats.dias_restantes ?? 0) > 0 && (
              <> com {stats.dias_restantes} dias restantes</>
            )}
          </Alert>
        )}

        {/* Planos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {planos.map((plano) => {
            const isCurrentPlan = stats?.plano === plano.id;
            const isPopular = plano.id === 'premium';
            const isVip = plano.id === 'vip';

            return (
              <div
                key={plano.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                  isVip ? 'ring-2 ring-yellow-400' : isPopular ? 'ring-2 ring-pink-500' : ''
                }`}
              >
                {/* Badge */}
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-pink-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                    Mais Popular
                  </div>
                )}
                {isVip && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                    👑 Máximo Destaque
                  </div>
                )}

                <div className="p-8">
                  {/* Ícone */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    isVip ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    isPopular ? 'bg-pink-500' : 'bg-gray-200'
                  }`}>
                    <span className="text-3xl">
                      {isVip ? '👑' : isPopular ? '⭐' : '🆓'}
                    </span>
                  </div>

                  {/* Nome */}
                  <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">{plano.nome}</h2>

                  {/* Preço */}
                  <div className="text-center mb-6">
                    {plano.preco > 0 ? (
                      <>
                        <span className="text-4xl font-bold text-gray-800">
                          {formatCurrency(plano.preco)}
                        </span>
                        <span className="text-gray-500">/mês</span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold text-gray-800">Grátis</span>
                    )}
                  </div>

                  {/* Benefícios */}
                  <ul className="space-y-3 mb-8">
                    {plano.beneficios.map((beneficio, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg className={`w-5 h-5 flex-shrink-0 ${
                          isVip ? 'text-yellow-500' : isPopular ? 'text-pink-500' : 'text-green-500'
                        }`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">{beneficio}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Botão */}
                  <Button
                    onClick={() => handleSelectPlan(plano.id)}
                    disabled={isCurrentPlan || processingPlan !== null}
                    isLoading={processingPlan === plano.id}
                    variant={isVip ? 'secondary' : isPopular ? 'primary' : 'outline'}
                    className={`w-full ${isVip ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 border-0' : ''}`}
                    size="lg"
                  >
                    {isCurrentPlan ? 'Plano Atual' : plano.preco > 0 ? 'Assinar Agora' : 'Gratuito'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Perguntas Frequentes</h2>
          
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-800 mb-2">Como funciona o pagamento?</h3>
              <p className="text-gray-600">Aceitamos Pix, cartão de crédito e boleto através do Mercado Pago. O pagamento é processado de forma segura.</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-gray-800 mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-gray-600">Sim! Você pode cancelar a renovação automática quando quiser. Seu plano continua ativo até o final do período pago.</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-gray-800 mb-2">Qual a diferença entre os planos?</h3>
              <p className="text-gray-600">Quanto maior o plano, mais destaque você tem nas buscas, mais fotos pode adicionar e mais recursos de visibilidade você ganha.</p>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Precisa de ajuda para escolher?</p>
          <a href="https://wa.me/5521999999999" target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              Falar com Suporte
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
