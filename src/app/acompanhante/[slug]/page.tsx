'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, AcompanhanteCompleta } from '@/lib/api';
import { Button, Card, Badge, Spinner } from '@/components/ui';
import { formatCurrency, getWhatsAppLink } from '@/lib/utils';

export default function PerfilPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [acompanhante, setAcompanhante] = useState<AcompanhanteCompleta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const loadPerfil = async () => {
      try {
        const data = await api.acompanhantes.get(slug);
        setAcompanhante(data);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPerfil();
  }, [slug]);

  const handleWhatsAppClick = async () => {
    if (!acompanhante) return;
    
    try {
      await api.acompanhantes.track(acompanhante.id, 'whatsapp');
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
    
    const message = `Olá ${acompanhante.nome}! Vi seu perfil no ScortRio e gostaria de saber mais.`;
    window.open(getWhatsAppLink(acompanhante.whatsapp, message), '_blank');
  };

  const handlePhoneClick = async () => {
    if (!acompanhante) return;
    
    try {
      await api.acompanhantes.track(acompanhante.id, 'telefone');
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
    
    window.location.href = `tel:${acompanhante.telefone || acompanhante.whatsapp}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!acompanhante) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Perfil não encontrado</h1>
        <Link href="/acompanhantes">
          <Button>Ver outras acompanhantes</Button>
        </Link>
      </div>
    );
  }

  const fotos = acompanhante.galeria?.length > 0 
    ? acompanhante.galeria 
    : [{ id: 0, thumbnail: acompanhante.foto_principal, medium: acompanhante.foto_principal, large: acompanhante.foto_principal, full: acompanhante.foto_principal }];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-pink-600">ScortRio</Link>
            <Link href="/acompanhantes">
              <Button variant="outline" size="sm">Ver Todas</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-pink-600">Home</Link>
          {' / '}
          <Link href="/acompanhantes" className="hover:text-pink-600">Acompanhantes</Link>
          {' / '}
          <span className="text-gray-800">{acompanhante.nome}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Galeria */}
          <div className="lg:col-span-2">
            {/* Foto Principal */}
            <div 
              className="relative aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden cursor-pointer mb-4"
              onClick={() => setShowGallery(true)}
            >
              <img
                src={fotos[currentPhoto]?.large || fotos[currentPhoto]?.full}
                alt={acompanhante.nome}
                className="w-full h-full object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {acompanhante.verificada && (
                  <Badge variant="success" className="text-base px-3 py-1">✅ Verificada</Badge>
                )}
                {acompanhante.plano === 'vip' && (
                  <Badge variant="vip" className="text-base px-3 py-1">👑 VIP</Badge>
                )}
                {acompanhante.plano === 'premium' && (
                  <Badge variant="premium" className="text-base px-3 py-1">⭐ Premium</Badge>
                )}
              </div>

              {/* Online */}
              {acompanhante.online && (
                <div className="absolute top-4 right-4">
                  <span className="flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Online agora
                  </span>
                </div>
              )}

              {/* Views */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                👁 {acompanhante.views?.toLocaleString('pt-BR')} visualizações
              </div>
            </div>

            {/* Thumbnails */}
            {fotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {fotos.map((foto, index) => (
                  <button
                    key={foto.id}
                    onClick={() => setCurrentPhoto(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentPhoto === index ? 'border-pink-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={foto.thumbnail}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Descrição */}
            <Card className="mt-6">
              <h2 className="font-semibold text-gray-800 mb-3">Sobre mim</h2>
              <p className="text-gray-600 whitespace-pre-line">
                {acompanhante.descricao || 'Sem descrição disponível.'}
              </p>
            </Card>

            {/* Serviços */}
            {acompanhante.servicos && acompanhante.servicos.length > 0 && (
              <Card className="mt-6">
                <h2 className="font-semibold text-gray-800 mb-3">💋 Serviços</h2>
                <div className="flex flex-wrap gap-2">
                  {acompanhante.servicos.map(servico => (
                    <span key={servico.id} className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-sm">
                      {servico.nome}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card className="sticky top-24">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  {acompanhante.nome}, {acompanhante.idade}
                </h1>
                {acompanhante.headline && (
                  <p className="text-gray-600 mt-1">{acompanhante.headline}</p>
                )}
                <p className="text-gray-500 mt-2">
                  📍 {acompanhante.bairro}, {acompanhante.cidade}
                </p>
              </div>

              {/* Valores */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">30min</p>
                    <p className="font-bold text-gray-800">
                      {acompanhante.valor_meia_hora ? formatCurrency(acompanhante.valor_meia_hora) : '-'}
                    </p>
                  </div>
                  <div className="border-x border-gray-200">
                    <p className="text-sm text-gray-500">1 hora</p>
                    <p className="font-bold text-pink-600 text-lg">
                      {formatCurrency(acompanhante.valor_hora)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pernoite</p>
                    <p className="font-bold text-gray-800">
                      {acompanhante.valor_pernoite ? formatCurrency(acompanhante.valor_pernoite) : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Contato */}
              <div className="space-y-3">
                <Button onClick={handleWhatsAppClick} className="w-full bg-green-500 hover:bg-green-600" size="lg">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </Button>
                
                {(acompanhante.telefone || acompanhante.whatsapp) && (
                  <Button onClick={handlePhoneClick} variant="outline" className="w-full" size="lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Ligar
                  </Button>
                )}
              </div>

              {/* Pagamento */}
              <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500">
                {acompanhante.aceita_pix && <span>💳 Pix</span>}
                {acompanhante.aceita_cartao && <span>💳 Cartão</span>}
                {acompanhante.atende_local && <span>🏠 Local próprio</span>}
              </div>
            </Card>

            {/* Características */}
            <Card>
              <h2 className="font-semibold text-gray-800 mb-4">✨ Características</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {acompanhante.altura && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Altura</span>
                    <span className="text-gray-800">{acompanhante.altura} cm</span>
                  </div>
                )}
                {acompanhante.peso && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Peso</span>
                    <span className="text-gray-800">{acompanhante.peso} kg</span>
                  </div>
                )}
                {acompanhante.medidas && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Medidas</span>
                    <span className="text-gray-800">{acompanhante.medidas}</span>
                  </div>
                )}
                {acompanhante.cor_olhos && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Olhos</span>
                    <span className="text-gray-800 capitalize">{acompanhante.cor_olhos}</span>
                  </div>
                )}
                {acompanhante.cor_cabelo && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cabelo</span>
                    <span className="text-gray-800 capitalize">{acompanhante.cor_cabelo}</span>
                  </div>
                )}
                {acompanhante.etnia && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Etnia</span>
                    <span className="text-gray-800 capitalize">{acompanhante.etnia}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {showGallery && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setShowGallery(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white text-4xl"
            onClick={() => setShowGallery(false)}
          >
            ×
          </button>
          
          <button
            className="absolute left-4 text-white text-4xl p-4"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPhoto(prev => prev > 0 ? prev - 1 : fotos.length - 1);
            }}
          >
            ‹
          </button>
          
          <img
            src={fotos[currentPhoto]?.full || fotos[currentPhoto]?.large}
            alt={acompanhante.nome}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          
          <button
            className="absolute right-4 text-white text-4xl p-4"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPhoto(prev => prev < fotos.length - 1 ? prev + 1 : 0);
            }}
          >
            ›
          </button>
          
          <div className="absolute bottom-4 text-white">
            {currentPhoto + 1} / {fotos.length}
          </div>
        </div>
      )}
    </div>
  );
}
