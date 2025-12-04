/**
 * ScortRio API Client
 * Cliente para comunicação com WordPress REST API
 */

const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://escortsacompanhantes.com/wp-json';
const API_BASE = `${API_URL}/scortrio/v1`;

// Tipos
export interface Acompanhante {
  id: number;
  slug: string;
  nome: string;
  idade: number | null;
  headline: string;
  cidade: string;
  cidade_slug: string;
  estado: string;
  bairro: string;
  bairro_slug: string;
  categoria: string;
  categoria_slug: string;
  valor_hora: number;
  foto_principal: string;
  foto_thumbnail: string;
  verificada: boolean;
  online: boolean;
  destaque: boolean;
  plano: 'free' | 'premium' | 'vip';
  atende_local: boolean;
}

export interface AcompanhanteCompleta extends Acompanhante {
  descricao: string;
  whatsapp: string;
  telefone: string;
  altura: number;
  peso: number;
  medidas: string;
  cor_olhos: string;
  cor_cabelo: string;
  etnia: string;
  silicone: string;
  valor_meia_hora: number;
  valor_pernoite: number;
  aceita_cartao: boolean;
  aceita_pix: boolean;
  servicos: { id: number; nome: string; slug: string }[];
  galeria: { id: number; thumbnail: string; medium: string; large: string; full: string }[];
  views: number;
}

export interface PerfilCompleto extends AcompanhanteCompleta {
  status: string;
  data_nascimento: string;
  cidade_id: number | null;
  bairro_id: number | null;
  categoria_id: number | null;
  servicos_ids: number[];
  whatsapp_clicks: number;
  phone_clicks: number;
  favoritos: number;
}

export interface User {
  id: number;
  email: string;
  nome: string;
  role: string;
  tem_perfil: boolean;
  perfil_status: string | null;
  perfil_id: number | null;
  plano?: 'free' | 'premium' | 'vip';
  slug?: string;
}

export interface Cidade {
  id: number;
  nome: string;
  slug: string;
  count: number;
}

export interface Servico {
  id: number;
  nome: string;
  slug: string;
  count: number;
}

export interface Categoria {
  id: number;
  nome: string;
  slug: string;
  count: number;
}

export interface Plano {
  id: string;
  nome: string;
  preco: number;
  duracao_dias: number;
  beneficios: string[];
}

export interface DashboardStats {
  tem_perfil: boolean;
  perfil_status?: string;
  plano?: string;
  plano_expira?: string;
  dias_restantes?: number | null;
  stats?: {
    views: number;
    whatsapp_clicks: number;
    phone_clicks: number;
    favoritos: number;
    taxa_conversao: number;
  };
}

// Helper para fazer requisições
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Erro ${response.status}`);
  }

  return data;
}

// API
export const api = {
  // ========== AUTENTICAÇÃO ==========
  auth: {
    async register(data: { nome: string; email: string; password: string; whatsapp?: string }) {
      return fetchAPI<{
        success: boolean;
        message?: string;
        token?: string;
        user?: User;
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async login(email: string, password: string) {
      return fetchAPI<{
        success: boolean;
        message?: string;
        token?: string;
        user?: User;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    async me(token: string) {
      return fetchAPI<User>('/auth/me', {}, token);
    },

    async forgotPassword(email: string) {
      return fetchAPI<{ success: boolean; message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
  },

  // ========== PERFIL DA ANUNCIANTE ==========
  perfil: {
    async get(token: string) {
      return fetchAPI<{
        existe: boolean;
        perfil: PerfilCompleto | null;
      }>('/meu-perfil', {}, token);
    },

    async save(token: string, data: Record<string, any>) {
      return fetchAPI<{
        success: boolean;
        message: string;
        perfil_id: number;
        status: string;
      }>('/meu-perfil', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token);
    },

    async uploadFoto(token: string, file: File) {
      const formData = new FormData();
      formData.append('foto', file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro no upload');
      }

      return data as {
        success: boolean;
        id: number;
        url: string;
        sizes: {
          thumbnail: string;
          medium: string;
          large: string;
          full: string;
        };
      };
    },

    async deleteFoto(token: string, id: number) {
      return fetchAPI<{ success: boolean; message: string }>(`/upload/${id}`, {
        method: 'DELETE',
      }, token);
    },
  },

  // ========== LISTAGEM PÚBLICA ==========
  acompanhantes: {
    async listar(params?: {
      page?: number;
      per_page?: number;
      cidade?: string;
      bairro?: string;
      categoria?: string;
      preco_min?: number;
      preco_max?: number;
      verificada?: boolean;
      online?: boolean;
      destaque?: boolean;
      ordenar?: 'recentes' | 'preco_asc' | 'preco_desc' | 'popular';
      busca?: string;
    }) {
      const searchParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }

      const query = searchParams.toString();
      return fetchAPI<{
        data: Acompanhante[];
        total: number;
        pages: number;
        current_page: number;
      }>(`/acompanhantes${query ? `?${query}` : ''}`);
    },

    async get(slug: string) {
      return fetchAPI<AcompanhanteCompleta>(`/acompanhante/${slug}`);
    },

    async track(id: number, tipo: 'whatsapp' | 'telefone' | 'favorito') {
      return fetchAPI<{ success: boolean }>(`/acompanhante/${id}/track`, {
        method: 'POST',
        body: JSON.stringify({ tipo }),
      });
    },
  },

  // ========== TAXONOMIAS ==========
  taxonomias: {
    async getCidades() {
      return fetchAPI<Cidade[]>('/cidades');
    },

    async getServicos() {
      return fetchAPI<Servico[]>('/servicos');
    },

    async getCategorias() {
      return fetchAPI<Categoria[]>('/categorias');
    },

    async getBairros(cidade?: string) {
      const query = cidade ? `?cidade=${cidade}` : '';
      return fetchAPI<Cidade[]>(`/bairros${query}`);
    },
  },

  // ========== PLANOS E PAGAMENTOS ==========
  planos: {
    async listar() {
      return fetchAPI<Plano[]>('/planos');
    },

    async criarPagamento(token: string, plano: string) {
      return fetchAPI<{
        success: boolean;
        preference_id: string;
        init_point: string;
        sandbox_init_point?: string;
      }>('/pagamento/criar', {
        method: 'POST',
        body: JSON.stringify({ plano }),
      }, token);
    },
  },

  // ========== DASHBOARD ==========
  dashboard: {
    async getStats(token: string) {
      return fetchAPI<DashboardStats>('/dashboard/stats', {}, token);
    },
  },

  // ========== ADMIN ==========
  admin: {
    async getPendentes(token: string) {
      return fetchAPI<{
        total: number;
        pendentes: PerfilCompleto[];
      }>('/admin/pendentes', {}, token);
    },

    async aprovar(token: string, id: number) {
      return fetchAPI<{ success: boolean; message: string }>(`/admin/aprovar/${id}`, {
        method: 'POST',
      }, token);
    },

    async reprovar(token: string, id: number, motivo: string) {
      return fetchAPI<{ success: boolean; message: string }>(`/admin/reprovar/${id}`, {
        method: 'POST',
        body: JSON.stringify({ motivo }),
      }, token);
    },
  },
};

export default api;
