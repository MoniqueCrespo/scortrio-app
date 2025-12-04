'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Foto {
  id: number;
  thumbnail: string;
  medium: string;
  large: string;
  full: string;
}

export default function FotosPage() {
  const { isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [galeriaIds, setGaleriaIds] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFotos();
    }
  }, [isAuthenticated]);

  const loadFotos = async () => {
    if (!token) return;
    try {
      const perfilData = await api.perfil.get(token);
      
      if (perfilData.existe && perfilData.perfil?.galeria) {
        setFotos(perfilData.perfil.galeria);
        setGaleriaIds(perfilData.perfil.galeria.map((f: Foto) => f.id));
      }
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setError('');
    setSuccess('');
    setUploading(true);

    const uploadedFotos: Foto[] = [];

    for (const file of Array.from(files)) {
      // Validar tipo
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Formato não permitido. Use JPG, PNG ou WebP.');
        continue;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Arquivo muito grande. Máximo 5MB.');
        continue;
      }

      try {
        const result = await api.perfil.uploadFoto(token!, file);
        
        if (result.success && result.id && result.sizes) {
          uploadedFotos.push({
            id: result.id,
            thumbnail: result.sizes.thumbnail || result.url || '',
            medium: result.sizes.medium || result.url || '',
            large: result.sizes.large || result.url || '',
            full: result.sizes.full || result.url || ''
          });
        } else {
          setError('Erro ao fazer upload');
        }
      } catch (err) {
        setError('Erro ao fazer upload');
      }
    }

    if (uploadedFotos.length > 0) {
      const novasFotos = [...fotos, ...uploadedFotos];
      setFotos(novasFotos);
      setGaleriaIds(novasFotos.map(f => f.id));
      setSuccess(`${uploadedFotos.length} foto(s) enviada(s)!`);
      
      // Salvar galeria no perfil
      await salvarGaleria(novasFotos.map(f => f.id));
    }

    setUploading(false);
  };

  const salvarGaleria = async (ids: number[]) => {
    if (!token) return;
    try {
      await api.perfil.save(token, { galeria: ids.join(',') });
    } catch (err) {
      console.error('Erro ao salvar galeria:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) return;
    if (!token) return;
    
    try {
      await api.perfil.deleteFoto(token, id);
      
      const novasFotos = fotos.filter(f => f.id !== id);
      setFotos(novasFotos);
      setGaleriaIds(novasFotos.map(f => f.id));
      
      // Atualizar galeria no perfil
      await salvarGaleria(novasFotos.map(f => f.id));
      
      setSuccess('Foto excluída!');
    } catch (err) {
      setError('Erro ao excluir foto');
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const novasFotos = [...fotos];
    const [removed] = novasFotos.splice(fromIndex, 1);
    novasFotos.splice(toIndex, 0, removed);
    
    setFotos(novasFotos);
    setGaleriaIds(novasFotos.map(f => f.id));
    
    // Salvar nova ordem
    await salvarGaleria(novasFotos.map(f => f.id));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, []);

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Minhas Fotos</h1>
        <p className="text-gray-600 mb-6">
          A primeira foto será sua foto principal. Arraste para reordenar.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
            {success}
          </div>
        )}

        {/* Upload area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-8 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragOver
              ? 'border-rose-500 bg-rose-50'
              : 'border-gray-300 hover:border-rose-400'
          }`}
        >
          <input
            type="file"
            id="fotos"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          
          <div className="mb-4">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-600">Enviando...</span>
              </div>
            ) : (
              <>
                <p className="text-gray-700 font-medium mb-1">
                  Arraste fotos aqui ou{' '}
                  <label htmlFor="fotos" className="text-rose-500 cursor-pointer hover:text-rose-600">
                    clique para selecionar
                  </label>
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG ou WebP. Máximo 5MB por foto.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Galeria */}
        {fotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotos.map((foto, index) => (
              <div
                key={foto.id}
                className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100"
              >
                <img
                  src={foto.medium || foto.large}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Badge primeira foto */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-rose-500 text-white text-xs font-medium rounded">
                    Principal
                  </div>
                )}
                
                {/* Overlay com ações */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index > 0 && (
                    <button
                      onClick={() => handleReorder(index, 0)}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      title="Definir como principal"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(foto.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Excluir"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500">Você ainda não tem fotos</p>
            <p className="text-sm text-gray-400 mt-1">Adicione fotos para deixar seu perfil mais atrativo</p>
          </div>
        )}

        {/* Dicas */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-amber-800 mb-3">💡 Dicas para fotos de sucesso</h3>
          <ul className="space-y-2 text-amber-700 text-sm">
            <li>• Use fotos de alta qualidade e bem iluminadas</li>
            <li>• Evite filtros excessivos - seja autêntica</li>
            <li>• Mostre seu rosto em pelo menos uma foto</li>
            <li>• Varie entre fotos de corpo inteiro e close</li>
            <li>• A primeira foto é a mais importante - escolha bem!</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
