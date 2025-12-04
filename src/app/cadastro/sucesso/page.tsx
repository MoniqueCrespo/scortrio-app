'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CadastroSucessoPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/cadastro');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center">
        {/* Ícone de sucesso */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Conta criada com sucesso! 🎉
        </h1>

        <p className="text-gray-600 mb-8">
          Olá <span className="font-semibold text-rose-500">{user?.nome || 'linda'}</span>! Sua conta foi criada. 
          Agora você pode completar seu perfil e começar a anunciar.
        </p>

        {/* Próximos passos */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-4">Próximos passos:</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                1
              </div>
              <p className="text-gray-600">Complete seu perfil com fotos e informações</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                2
              </div>
              <p className="text-gray-600">Aguarde a aprovação da nossa equipe</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                3
              </div>
              <p className="text-gray-600">Seu anúncio vai ao ar e você começa a receber contatos!</p>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/perfil"
          className="inline-block w-full py-3 px-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
        >
          Completar meu perfil
        </Link>

        <div className="mt-4">
          <Link href="/dashboard" className="text-rose-500 hover:text-rose-600 text-sm">
            Ir para o Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
