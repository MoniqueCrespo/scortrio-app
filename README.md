# ScortRio Frontend - Sistema de Autenticação e Dashboard

Este pacote contém todos os arquivos do frontend para o sistema de autenticação e dashboard das anunciantes.

## 📁 Estrutura de Arquivos

```
src/
├── contexts/
│   └── AuthContext.tsx        # Context de autenticação (JWT)
├── lib/
│   └── auth-api.ts            # Funções da API (login, register, etc)
├── components/
│   ├── Providers.tsx          # Wrapper com AuthProvider
│   └── dashboard/
│       └── DashboardLayout.tsx # Layout com sidebar
├── app/
│   ├── login/
│   │   └── page.tsx           # Página de login
│   ├── cadastro/
│   │   ├── page.tsx           # Página de cadastro
│   │   └── sucesso/
│   │       └── page.tsx       # Sucesso do cadastro
│   ├── esqueci-senha/
│   │   └── page.tsx           # Recuperar senha
│   └── dashboard/
│       ├── page.tsx           # Dashboard principal
│       ├── perfil/
│       │   └── page.tsx       # Editar perfil
│       ├── fotos/
│       │   └── page.tsx       # Gerenciar fotos
│       └── planos/
│           └── page.tsx       # Planos e checkout
```

## 🚀 Instalação

### 1. Copie os arquivos para seu projeto

Copie a pasta `src/` deste pacote para seu projeto Next.js existente.

### 2. Atualize o layout.tsx principal

No seu `src/app/layout.tsx`, adicione o Provider:

```tsx
import { Providers } from '@/components/Providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 3. Configure as variáveis de ambiente

No seu `.env.local`:

```env
NEXT_PUBLIC_WP_API_URL=https://escortsacompanhantes.com/wp-json
NEXT_PUBLIC_SITE_URL=https://scortrio.com
```

### 4. Instale o código PHP no WordPress

Certifique-se de que o arquivo `scortrio-api-completa.php` está instalado no WordPress.

## 🔐 Sistema de Autenticação

O sistema usa JWT (JSON Web Token) para autenticação:

- **Login**: Envia email/senha → Recebe token → Salva no localStorage
- **Registro**: Cria conta → Recebe token → Redireciona para sucesso
- **Proteção**: Rotas do dashboard verificam se há token válido
- **Logout**: Remove token do localStorage

## 📱 Páginas Criadas

| Rota | Descrição |
|------|-----------|
| `/login` | Login de anunciantes |
| `/cadastro` | Registro de novas anunciantes |
| `/cadastro/sucesso` | Confirmação após registro |
| `/esqueci-senha` | Recuperação de senha |
| `/dashboard` | Painel principal |
| `/dashboard/perfil` | Editar perfil |
| `/dashboard/fotos` | Gerenciar galeria |
| `/dashboard/planos` | Ver e assinar planos |

## 🎨 Design

O design usa:
- Tailwind CSS para estilos
- Gradientes rosa/pink para branding
- Cards com sombras sutis
- Animações de loading
- Responsivo (mobile-first)

## 🔗 Integração com WordPress

A API do WordPress fornece:

```
POST /wp-json/scortrio/v1/auth/register
POST /wp-json/scortrio/v1/auth/login
GET  /wp-json/scortrio/v1/auth/me
POST /wp-json/scortrio/v1/meu-perfil
POST /wp-json/scortrio/v1/upload
GET  /wp-json/scortrio/v1/dashboard/stats
GET  /wp-json/scortrio/v1/planos
POST /wp-json/scortrio/v1/pagamento/criar
```

## ✅ Checklist de Deploy

- [ ] Copiar arquivos para o projeto
- [ ] Adicionar Providers no layout
- [ ] Configurar variáveis de ambiente
- [ ] Instalar código PHP no WordPress
- [ ] Criar cidades/bairros/categorias no WordPress
- [ ] Configurar Mercado Pago no WordPress
- [ ] Testar fluxo de cadastro
- [ ] Testar fluxo de login
- [ ] Testar upload de fotos
- [ ] Testar pagamento
