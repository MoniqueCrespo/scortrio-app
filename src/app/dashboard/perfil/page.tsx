'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Taxonomia {
  id: number;
  nome: string;
  slug: string;
}

export default function PerfilPage() {
  const { isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [cidades, setCidades] = useState<Taxonomia[]>([]);
  const [bairros, setBairros] = useState<Taxonomia[]>([]);
  const [categorias, setCategorias] = useState<Taxonomia[]>([]);
  const [servicos, setServicos] = useState<Taxonomia[]>([]);
  
  const [formData, setFormData] = useState({
    nome: '',
    headline: '',
    descricao: '',
    data_nascimento: '',
    estado: 'RJ',
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
    aceita_pix: true,
    servicos: [] as number[]
  });

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
      // Carregar taxonomias
      const [cidadesData, bairrosData, categoriasData, servicosData] = await Promise.all([
        api.taxonomias.getCidades(),
        api.taxonomias.getBairros(),
        api.taxonomias.getCategorias(),
        api.taxonomias.getServicos()
      ]);
      
      setCidades(cidadesData);
      setBairros(bairrosData);
      setCategorias(categoriasData);
      setServicos(servicosData);

      // Carregar perfil existente
      if (!token) return;
      const perfilData = await api.perfil.get(token);
      
      if (perfilData.existe && perfilData.perfil) {
        const p = perfilData.perfil;
        setFormData({
          nome: p.nome || '',
          headline: p.headline || '',
          descricao: p.descricao || '',
          data_nascimento: p.data_nascimento || '',
          estado: p.estado || 'RJ',
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
          aceita_pix: p.aceita_pix ?? true,
          servicos: p.servicos_ids || []
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleServicoChange = (servicoId: number) => {
    const servicos = formData.servicos.includes(servicoId)
      ? formData.servicos.filter(id => id !== servicoId)
      : [...formData.servicos, servicoId];
    
    setFormData({ ...formData, servicos });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const dataToSend = {
        ...formData,
        cidade_id: formData.cidade_id ? parseInt(formData.cidade_id) : null,
        bairro_id: formData.bairro_id ? parseInt(formData.bairro_id) : null,
        categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : null,
        altura: formData.altura ? parseInt(formData.altura) : null,
        peso: formData.peso ? parseInt(formData.peso) : null,
        valor_hora: formData.valor_hora ? parseInt(formData.valor_hora) : null,
        valor_meia_hora: formData.valor_meia_hora ? parseInt(formData.valor_meia_hora) : null,
        valor_pernoite: formData.valor_pernoite ? parseInt(formData.valor_pernoite) : null
      };

      if (!token) {
        setError('Sessão expirada. Faça login novamente.');
        return;
      }
      
      const result = await api.perfil.save(token, dataToSend);

      if (result.success) {
        setSuccess(result.message || 'Perfil salvo com sucesso!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(result.message || 'Erro ao salvar perfil');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSaving(false);
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

  const estados = [
    { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' }, { uf: 'AP', nome: 'Amapá' },
    { uf: 'AM', nome: 'Amazonas' }, { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
    { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' }, { uf: 'GO', nome: 'Goiás' },
    { uf: 'MA', nome: 'Maranhão' }, { uf: 'MT', nome: 'Mato Grosso' }, { uf: 'MS', nome: 'Mato Grosso do Sul' },
    { uf: 'MG', nome: 'Minas Gerais' }, { uf: 'PA', nome: 'Pará' }, { uf: 'PB', nome: 'Paraíba' },
    { uf: 'PR', nome: 'Paraná' }, { uf: 'PE', nome: 'Pernambuco' }, { uf: 'PI', nome: 'Piauí' },
    { uf: 'RJ', nome: 'Rio de Janeiro' }, { uf: 'RN', nome: 'Rio Grande do Norte' },
    { uf: 'RS', nome: 'Rio Grande do Sul' }, { uf: 'RO', nome: 'Rondônia' }, { uf: 'RR', nome: 'Roraima' },
    { uf: 'SC', nome: 'Santa Catarina' }, { uf: 'SP', nome: 'São Paulo' }, { uf: 'SE', nome: 'Sergipe' },
    { uf: 'TO', nome: 'Tocantins' }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h1>

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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações básicas */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome artístico *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Selecione...</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frase de destaque
                </label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  placeholder="Ex: Morena elegante para momentos especiais"
                  maxLength={150}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none"
                  placeholder="Fale um pouco sobre você..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  name="data_nascimento"
                  value={formData.data_nascimento}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Localização</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                >
                  {estados.map(e => (
                    <option key={e.uf} value={e.uf}>{e.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <select
                  name="cidade_id"
                  value={formData.cidade_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                >
                  <option value="">Selecione...</option>
                  {cidades.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro
                </label>
                <select
                  name="bairro_id"
                  value={formData.bairro_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                >
                  <option value="">Selecione...</option>
                  {bairros.map(b => (
                    <option key={b.id} value={b.id}>{b.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contato</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  placeholder="21999999999"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  placeholder="2133333333"
                />
              </div>
            </div>
          </div>

          {/* Características físicas */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Características</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  name="altura"
                  value={formData.altura}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  placeholder="165"
                  min="140"
                  max="200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  placeholder="55"
                  min="40"
                  max="150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medidas
                </label>
                <input
                  type="text"
                  name="medidas"
                  value={formData.medidas}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  placeholder="90-60-90"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor dos olhos
                </label>
                <select
                  name="cor_olhos"
                  value={formData.cor_olhos}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value="castanhos">Castanhos</option>
                  <option value="pretos">Pretos</option>
                  <option value="verdes">Verdes</option>
                  <option value="azuis">Azuis</option>
                  <option value="mel">Mel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor do cabelo
                </label>
                <select
                  name="cor_cabelo"
                  value={formData.cor_cabelo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value="preto">Preto</option>
                  <option value="castanho">Castanho</option>
                  <option value="loiro">Loiro</option>
                  <option value="ruivo">Ruivo</option>
                  <option value="colorido">Colorido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etnia
                </label>
                <select
                  name="etnia"
                  value={formData.etnia}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value="branca">Branca</option>
                  <option value="negra">Negra</option>
                  <option value="morena">Morena</option>
                  <option value="mulata">Mulata</option>
                  <option value="oriental">Oriental</option>
                  <option value="indigena">Indígena</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Silicone
                </label>
                <select
                  name="silicone"
                  value={formData.silicone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value="nao">Não tem</option>
                  <option value="seios">Nos seios</option>
                  <option value="bumbum">No bumbum</option>
                  <option value="ambos">Seios e bumbum</option>
                </select>
              </div>
            </div>
          </div>

          {/* Valores */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Valores</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor/Hora (R$) *
                </label>
                <input
                  type="number"
                  name="valor_hora"
                  value={formData.valor_hora}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  placeholder="400"
                  min="0"
                  step="10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor/Meia Hora (R$)
                </label>
                <input
                  type="number"
                  name="valor_meia_hora"
                  value={formData.valor_meia_hora}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  placeholder="250"
                  min="0"
                  step="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor/Pernoite (R$)
                </label>
                <input
                  type="number"
                  name="valor_pernoite"
                  value={formData.valor_pernoite}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  placeholder="2000"
                  min="0"
                  step="100"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="atende_local"
                  checked={formData.atende_local}
                  onChange={handleChange}
                  className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500"
                />
                <span className="text-gray-700">Atendo em local próprio</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="aceita_cartao"
                  checked={formData.aceita_cartao}
                  onChange={handleChange}
                  className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500"
                />
                <span className="text-gray-700">Aceito cartão</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="aceita_pix"
                  checked={formData.aceita_pix}
                  onChange={handleChange}
                  className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500"
                />
                <span className="text-gray-700">Aceito Pix</span>
              </label>
            </div>
          </div>

          {/* Serviços */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Serviços</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {servicos.map(servico => (
                <label
                  key={servico.id}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.servicos.includes(servico.id)
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.servicos.includes(servico.id)}
                    onChange={() => handleServicoChange(servico.id)}
                    className="hidden"
                  />
                  <span className="text-sm">{servico.nome}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botão salvar */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                'Salvar Perfil'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
