/**
 * Auth API - Funções de autenticação e perfil
 */

import { api } from './api';

// Re-exporta tipos
export * from './api';

// Funções de autenticação
export const login = (email: string, password: string) => api.auth.login(email, password);
export const register = (data: { nome: string; email: string; password: string; whatsapp?: string }) => api.auth.register(data);
export const forgotPassword = (email: string) => api.auth.forgotPassword(email);
export const getMe = (token: string) => api.auth.me(token);

// Funções de perfil
export const getMeuPerfil = (token: string) => api.perfil.get(token);
export const salvarPerfil = (token: string, data: any) => api.perfil.save(token, data);
export const uploadFoto = (token: string, file: File) => api.perfil.uploadFoto(token, file);
export const deletarFoto = (token: string, id: number) => api.perfil.deleteFoto(token, id);

// Funções de taxonomias
export const getCidades = () => api.taxonomias.getCidades();
export const getBairros = (cidade?: string) => api.taxonomias.getBairros(cidade);
export const getCategorias = () => api.taxonomias.getCategorias();
export const getServicos = () => api.taxonomias.getServicos();

// Funções de planos e pagamentos
export const getPlanos = () => api.planos.listar();
export const criarPagamento = (token: string, plano: string) => api.planos.criarPagamento(token, plano);

// Funções de dashboard
export const getDashboardStats = (token: string) => api.dashboard.getStats(token);

// Funções de listagem pública
export const getAcompanhantes = (params?: any) => api.acompanhantes.listar(params);
export const getAcompanhante = (slug: string) => api.acompanhantes.get(slug);
export const trackClick = (id: number, tipo: 'whatsapp' | 'telefone' | 'favorito') => api.acompanhantes.track(id, tipo);

// Exporta o objeto api também
export { api, api as authApi };
