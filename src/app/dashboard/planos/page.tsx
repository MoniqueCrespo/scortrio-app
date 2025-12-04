'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Plano {
  id: string;
  nome: string;
  preco: number;
  duracao_dias: number;
  beneficios: string[];
}

export default function PlanosPage() {
  const { isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [planoAtual, setPlanoAtual] = useState<string>('free');
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);
  const [processando, setProcessando] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const planosData = await api.planos.listar();
      setPlanos(planosData);
      
      if (token) {
        const statsData = await api.dashboard.getStats(token);
        if (statsData.plano) {
          setPlanoAtual(statsData.plano);
          setDiasRestantes(statsData.dias_restantes ?? null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssinar = async (planoId: string) => {
    if (planoId === 'free' || !token) return;
    
    setError('');
    setProcessando(planoId);

    try {
      const result = await api.planos.criarPagamento(token, planoId);
      
      if (result.success && result.init_point) {
        // Redirecionar para o Mercado Pago
        window.location.href = result.init_point;
      } else {
        setError('Erro ao processar pagamento');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setProcessando(null);
    }
  };

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  const getPlanoPrioridade = (planoId: string): number => {
    const prioridades: Record<string, number> = { free: 0, premium: 1, vip: 2 };
    return prioridades[planoId] ?? 0;
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Escolha seu plano</h1>
          <p className="text-gray-600">
            Aumente sua visibilidade e receba mais contatos
          </p>
        </div>

        {/* Plano atual */}
        {planoAtual !== 'free' && (
          <div className="mb-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 text-white text-center">
            <p className="text-white/90 mb-1">Seu plano atual</p>
            <p className="text-2xl font-bold mb-1">
              {planoAtual === 'vip' ? '👑 VIP' : '⭐ Premium'}
            </p>
            {diasRestantes !== null && (
              <p className="text-white/80 text-sm">
                {diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Expirado'}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
            {error}
          </div>
        )}

        {/* Cards de planos */}
        <div className="grid md:grid-cols-3 gap-6">
          {planos.map((plano) => {
            const isAtual = plano.id === planoAtual;
            const isDowngrade = getPlanoPrioridade(plano.id) < getPlanoPrioridade(planoAtual);
            const isVIP = plano.id === 'vip';
            
            return (
              <div
                key={plano.id}
                className={`relative rounded-2xl p-6 ${
                  isVIP
                    ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300'
                    : 'bg-white border border-gray-200'
                } ${isAtual ? 'ring-2 ring-rose-500' : ''}`}
              >
                {/* Badge destaque */}
                {isVIP && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-medium rounded-full">
                    Mais popular
                  </div>
                )}

                {/* Badge plano atual */}
                {isAtual && (
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-rose-500 text-white text-xs font-medium rounded-full">
                    Seu plano
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plano.id === 'free' && '🆓 '}
                    {plano.id === 'premium' && '⭐ '}
                    {plano.id === 'vip' && '👑 '}
                    {plano.nome}
                  </h3>
                  
                  <div className="mb-2">
                    {plano.preco > 0 ? (
                      <>
                        <span className="text-4xl font-bold text-gray-900">
                          R$ {plano.preco.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-gray-500">/mês</span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold text-gray-900">Grátis</span>
                    )}
                  </div>
                  
                  {plano.duracao_dias > 0 && (
                    <p className="text-sm text-gray-500">
                      {plano.duracao_dias} dias de duração
                    </p>
                  )}
                </div>

                {/* Benefícios */}
                <ul className="space-y-3 mb-6">
                  {plano.beneficios.map((beneficio, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">{beneficio}</span>
                    </li>
                  ))}
                </ul>

                {/* Botão */}
                <button
                  onClick={() => handleAssinar(plano.id)}
                  disabled={isAtual || isDowngrade || plano.preco === 0 || processando !== null}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    isAtual
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isDowngrade
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plano.preco === 0
                      ? 'bg-gray-100 text-gray-500 cursor-default'
                      : isVIP
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600'
                      : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600'
                  } disabled:opacity-50`}
                >
                  {processando === plano.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando...
                    </span>
                  ) : isAtual ? (
                    'Plano atual'
                  ) : isDowngrade ? (
                    'Não disponível'
                  ) : plano.preco === 0 ? (
                    'Plano gratuito'
                  ) : (
                    'Assinar agora'
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Comparativo */}
        <div className="mt-12 bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Compare os planos</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Recurso</th>
                  <th className="text-center py-3 px-4 text-gray-600 font-medium">Free</th>
                  <th className="text-center py-3 px-4 text-gray-600 font-medium">Premium</th>
                  <th className="text-center py-3 px-4 text-gray-600 font-medium">VIP</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Número de fotos</td>
                  <td className="py-3 px-4 text-center">3</td>
                  <td className="py-3 px-4 text-center">10</td>
                  <td className="py-3 px-4 text-center">20</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Destaque na listagem</td>
                  <td className="py-3 px-4 text-center text-gray-400">—</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                  <td className="py-3 px-4 text-center text-green-500">✓✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Selo verificado</td>
                  <td className="py-3 px-4 text-center text-gray-400">—</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Posição nos resultados</td>
                  <td className="py-3 px-4 text-center">Normal</td>
                  <td className="py-3 px-4 text-center">Prioridade</td>
                  <td className="py-3 px-4 text-center">Topo</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Estatísticas</td>
                  <td className="py-3 px-4 text-center text-gray-400">—</td>
                  <td className="py-3 px-4 text-center">Básicas</td>
                  <td className="py-3 px-4 text-center">Completas</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Stories</td>
                  <td className="py-3 px-4 text-center text-gray-400">—</td>
                  <td className="py-3 px-4 text-center text-gray-400">—</td>
                  <td className="py-3 px-4 text-center text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Suporte</td>
                  <td className="py-3 px-4 text-center">E-mail</td>
                  <td className="py-3 px-4 text-center">E-mail</td>
                  <td className="py-3 px-4 text-center">Prioritário</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Perguntas frequentes</h2>
          
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Como funciona o pagamento?</h3>
              <p className="text-gray-600 text-sm">
                O pagamento é processado pelo Mercado Pago. Você pode pagar com Pix, cartão de crédito ou boleto. 
                Assim que confirmado, seu plano é ativado automaticamente.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-gray-600 text-sm">
                Sim! Não há renovação automática. Quando seu plano expirar, você volta automaticamente para o plano gratuito.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Quanto tempo leva para ativar?</h3>
              <p className="text-gray-600 text-sm">
                Com Pix ou cartão de crédito, a ativação é instantânea. Com boleto, pode levar até 3 dias úteis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
