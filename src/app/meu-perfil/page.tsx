'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, PerfilCompleto, Cidade, Servico, Categoria } from '@/lib/api';
import { Button, Input, Textarea, Select, Checkbox, Card, Spinner, Alert } from '@/components/ui';

interface FormData {
  nome: string;
  headline: string;
  descricao: string;
  data_nascimento: string;
  estado: string;
  cidade_id: string;
  bairro_id: string;
  categoria_id: string;
  whatsapp: string;
  telefone: string;
  altura: string;
  peso: string;
  medidas: string;
  cor_olhos: string;
  cor_cabelo: string;
  etnia: string;
  silicone: string;
  valor_hora: string;
  valor_meia_hora: string;
  valor_pernoite: string;
  atende_local: boolean;
  aceita_cartao: boolean;
  aceita_pix: boolean;
  servicos: number[];
  galeria: string;
}

const initialFormData: FormData = {
  nome: '',
  headline: '',
  descricao: '',
  data_nascimento: '',
  estado: '',
  cidade_id: '',
  bairro_id: '',
  categoria_id: '',
  whatsapp: '',
  telefone: '',
  altura: '',
  peso: '',
  medidas: '',
  cor_olhos: '',
  cor_cabelo: '',
  etnia: '',
  silicone: '',
  valor_hora: '',
  valor_meia_hora: '',
  valor_pernoite: '',
  atende_local: false,
  aceita_cartao: false,
  aceita_pix: false,
  servicos: [],
  galeria: '',
};

const estados = [
  { value: 'AC', label: 'Acre' }, { value: 'AL', label: 'Alagoas' }, { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' }, { value: 'BA', label: 'Bahia' }, { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' }, { value: 'ES', label: 'Espírito Santo' }, { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' }, { value: 'MT', label: 'Mato Grosso' }, { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' }, { value: 'PA', label: 'Pará' }, { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' }, { value: 'PE', label: 'Pernambuco' }, { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' }, { value: 'RN', label: 'Rio Grande do Norte' }, { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' }, { value: 'RR', label: 'Roraima' }, { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' }, { value: 'SE', label: 'Sergipe' }, { value: 'TO', label: 'Tocantins' },
];

export default function MeuPerfilPage() {
  const { user, token, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [fotos, setFotos] = useState<{ id: number; url: string }[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [bairros, setBairros] = useState<Cidade[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Carregar dados iniciais
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      if (!token) return;

      try {
        // Carregar taxonomias
        const [cidadesData, categoriasData, servicosData] = await Promise.all([
          api.taxonomias.getCidades(),
          api.taxonomias.getCategorias(),
          api.taxonomias.getServicos(),
        ]);

        setCidades(cidadesData);
        setCategorias(categoriasData);
        setServicos(servicosData);

        // Carregar perfil existente
        const perfilData = await api.perfil.get(token);

        if (perfilData.existe && perfilData.perfil) {
          const p = perfilData.perfil;
          setFormData({
            nome: p.nome || '',
            headline: p.headline || '',
            descricao: p.descricao || '',
            data_nascimento: p.data_nascimento || '',
            estado: p.estado || '',
            cidade_id: p.cidade_id?.toString() || '',
            bairro_id: p.bairro_id?.toString() || '',
            categoria_id: p.categoria_id?.toString() || '',
            whatsapp: p.whatsapp || '',
            telefone: p.telefone || '',
            altura: p.altura?.toString() || '',
            peso: p.peso?.toString() || '',
            medidas: p.medidas || '',
            cor_olhos: p.cor_olhos || '',
            cor_cabelo: p.cor_cabelo || '',
            etnia: p.etnia || '',
            silicone: p.silicone || '',
            valor_hora: p.valor_hora?.toString() || '',
            valor_meia_hora: p.valor_meia_hora?.toString() || '',
            valor_pernoite: p.valor_pernoite?.toString() || '',
            atende_local: p.atende_local || false,
            aceita_cartao: p.aceita_cartao || false,
            aceita_pix: p.aceita_pix || false,
            servicos: p.servicos_ids || [],
            galeria: p.galeria?.map(f => f.id).join(',') || '',
          });

          // Fotos
          if (p.galeria) {
            setFotos(p.galeria.map(f => ({ id: f.id, url: f.medium || f.large })));
          }

          // Bairros da cidade
          if (p.cidade_id) {
            const bairrosData = await api.taxonomias.getBairros();
            setBairros(bairrosData);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      loadData();
    }
  }, [token, authLoading, isAuthenticated, router]);

  // Atualizar bairros quando cidade mudar
  useEffect(() => {
    const loadBairros = async () => {
      if (formData.cidade_id) {
        try {
          const bairrosData = await api.taxonomias.getBairros();
          setBairros(bairrosData);
        } catch (error) {
          console.error('Erro ao carregar bairros:', error);
        }
      }
    };
    loadBairros();
  }, [formData.cidade_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleServicoToggle = (servicoId: number) => {
    setFormData(prev => ({
      ...prev,
      servicos: prev.servicos.includes(servicoId)
        ? prev.servicos.filter(id => id !== servicoId)
        : [...prev.servicos, servicoId],
    }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !token) return;

    setIsUploading(true);
    setError('');

    try {
      for (const file of Array.from(files)) {
        const result = await api.perfil.uploadFoto(token, file);
        setFotos(prev => [...prev, { id: result.id, url: result.sizes.medium || result.url }]);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveFoto = async (fotoId: number) => {
    if (!token) return;

    try {
      await api.perfil.deleteFoto(token, fotoId);
      setFotos(prev => prev.filter(f => f.id !== fotoId));
    } catch (err: any) {
      setError(err.message || 'Erro ao remover foto');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError('');
    setSuccess('');

    // Validações
    if (!formData.nome) {
      setError('Nome é obrigatório');
      return;
    }
    if (!formData.whatsapp) {
      setError('WhatsApp é obrigatório');
      return;
    }
    if (!formData.valor_hora) {
      setError('Valor por hora é obrigatório');
      return;
    }

    setIsSaving(true);

    try {
      const dataToSend = {
        ...formData,
        altura: formData.altura ? parseInt(formData.altura) : undefined,
        peso: formData.peso ? parseInt(formData.peso) : undefined,
        valor_hora: formData.valor_hora ? parseInt(formData.valor_hora) : undefined,
        valor_meia_hora: formData.valor_meia_hora ? parseInt(formData.valor_meia_hora) : undefined,
        valor_pernoite: formData.valor_pernoite ? parseInt(formData.valor_pernoite) : undefined,
        cidade_id: formData.cidade_id ? parseInt(formData.cidade_id) : undefined,
        bairro_id: formData.bairro_id ? parseInt(formData.bairro_id) : undefined,
        categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : undefined,
        galeria: fotos.map(f => f.id).join(','),
      };

      const result = await api.perfil.save(token, dataToSend);

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard" className="text-2xl font-bold text-pink-600">ScortRio</Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{user?.nome}</span>
              <button onClick={logout} className="text-gray-500 hover:text-gray-700">Sair</button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
            <p className="text-gray-600">Preencha seus dados para aparecer no site</p>
          </div>
        </div>

        {error && <Alert variant="error" className="mb-6">{error}</Alert>}
        {success && <Alert variant="success" className="mb-6">{success}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Fotos */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📸 Fotos</h2>
            <p className="text-sm text-gray-500 mb-4">A primeira foto será sua foto principal</p>
            
            <div className="flex flex-wrap gap-4">
              {fotos.map((foto, index) => (
                <div key={foto.id} className="relative w-32 h-32 group">
                  <img src={foto.url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                  {index === 0 && (
                    <span className="absolute top-1 left-1 bg-pink-600 text-white text-xs px-2 py-0.5 rounded">Principal</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveFoto(foto.id)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <label className={`w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 transition-colors ${isUploading ? 'opacity-50' : ''}`}>
                {isUploading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-gray-500 mt-1">Adicionar</span>
                  </>
                )}
                <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={isUploading} className="hidden" />
              </label>
            </div>
          </Card>

          {/* Dados Básicos */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">👤 Dados Básicos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nome artístico *" name="nome" value={formData.nome} onChange={handleChange} placeholder="Como quer ser chamada" />
              <Input label="Data de nascimento" name="data_nascimento" type="date" value={formData.data_nascimento} onChange={handleChange} />
              <div className="md:col-span-2">
                <Input label="Frase de destaque" name="headline" value={formData.headline} onChange={handleChange} placeholder="Ex: Morena elegante para momentos especiais" />
              </div>
              <Select label="Categoria" name="categoria_id" value={formData.categoria_id} onChange={handleChange} placeholder="Selecione..." options={categorias.map(c => ({ value: c.id.toString(), label: c.nome }))} />
            </div>
          </Card>

          {/* Localização */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📍 Localização</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select label="Estado" name="estado" value={formData.estado} onChange={handleChange} placeholder="Selecione..." options={estados} />
              <Select label="Cidade" name="cidade_id" value={formData.cidade_id} onChange={handleChange} placeholder="Selecione..." options={cidades.map(c => ({ value: c.id.toString(), label: c.nome }))} />
              <Select label="Bairro" name="bairro_id" value={formData.bairro_id} onChange={handleChange} placeholder="Selecione..." options={bairros.map(b => ({ value: b.id.toString(), label: b.nome }))} />
            </div>
          </Card>

          {/* Contato */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📱 Contato</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="WhatsApp *" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="21999999999" />
              <Input label="Telefone" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="2133333333" />
            </div>
          </Card>

          {/* Características */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">✨ Características</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input label="Altura (cm)" name="altura" type="number" value={formData.altura} onChange={handleChange} placeholder="165" />
              <Input label="Peso (kg)" name="peso" type="number" value={formData.peso} onChange={handleChange} placeholder="55" />
              <Input label="Medidas" name="medidas" value={formData.medidas} onChange={handleChange} placeholder="90-60-90" />
              <Select label="Cor dos olhos" name="cor_olhos" value={formData.cor_olhos} onChange={handleChange} placeholder="Selecione..." options={[
                { value: 'castanhos', label: 'Castanhos' }, { value: 'pretos', label: 'Pretos' },
                { value: 'verdes', label: 'Verdes' }, { value: 'azuis', label: 'Azuis' }, { value: 'mel', label: 'Mel' }
              ]} />
              <Select label="Cor do cabelo" name="cor_cabelo" value={formData.cor_cabelo} onChange={handleChange} placeholder="Selecione..." options={[
                { value: 'preto', label: 'Preto' }, { value: 'castanho', label: 'Castanho' },
                { value: 'loiro', label: 'Loiro' }, { value: 'ruivo', label: 'Ruivo' }, { value: 'colorido', label: 'Colorido' }
              ]} />
              <Select label="Etnia" name="etnia" value={formData.etnia} onChange={handleChange} placeholder="Selecione..." options={[
                { value: 'branca', label: 'Branca' }, { value: 'negra', label: 'Negra' },
                { value: 'morena', label: 'Morena' }, { value: 'mulata', label: 'Mulata' },
                { value: 'oriental', label: 'Oriental' }, { value: 'indigena', label: 'Indígena' }
              ]} />
              <Select label="Silicone" name="silicone" value={formData.silicone} onChange={handleChange} placeholder="Selecione..." options={[
                { value: 'nao', label: 'Não tem' }, { value: 'seios', label: 'Nos seios' },
                { value: 'bumbum', label: 'No bumbum' }, { value: 'ambos', label: 'Seios e bumbum' }
              ]} />
            </div>
          </Card>

          {/* Valores */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">💰 Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input label="Valor/Hora (R$) *" name="valor_hora" type="number" value={formData.valor_hora} onChange={handleChange} placeholder="400" />
              <Input label="Valor/Meia Hora (R$)" name="valor_meia_hora" type="number" value={formData.valor_meia_hora} onChange={handleChange} placeholder="250" />
              <Input label="Valor/Pernoite (R$)" name="valor_pernoite" type="number" value={formData.valor_pernoite} onChange={handleChange} placeholder="2000" />
            </div>
            <div className="flex flex-wrap gap-6">
              <Checkbox name="atende_local" checked={formData.atende_local} onChange={handleChange} label="Atendo em local próprio" />
              <Checkbox name="aceita_cartao" checked={formData.aceita_cartao} onChange={handleChange} label="Aceito cartão" />
              <Checkbox name="aceita_pix" checked={formData.aceita_pix} onChange={handleChange} label="Aceito Pix" />
            </div>
          </Card>

          {/* Serviços */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">💋 Serviços</h2>
            <div className="flex flex-wrap gap-3">
              {servicos.map(servico => (
                <button
                  key={servico.id}
                  type="button"
                  onClick={() => handleServicoToggle(servico.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    formData.servicos.includes(servico.id)
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {servico.nome}
                </button>
              ))}
            </div>
          </Card>

          {/* Descrição */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📝 Sobre você</h2>
            <Textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={5}
              placeholder="Conte um pouco sobre você, seus diferenciais, o que você oferece..."
            />
          </Card>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard">
              <Button type="button" variant="ghost">Cancelar</Button>
            </Link>
            <Button type="submit" size="lg" isLoading={isSaving}>
              Salvar Perfil
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
