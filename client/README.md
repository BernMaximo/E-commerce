# TechStore — Frontend

Frontend da plataforma **TechStore**, construído com **Next.js 16 (Pages Router)**, **React 19**, **TypeScript** e **Tailwind CSS 4**.

A aplicação consome a API REST em [`../server`](../server) e cobre o fluxo completo da loja e do painel administrativo.

> Documentação completa do projeto (arquitetura, DER, deploy e credenciais): **[README principal](../README.md)**.

---

## Requisitos

- Node.js 20+ e npm
- API rodando em `http://localhost:3333` (veja [`../server`](../server))

## Como rodar

```bash
cd client
npm install

cp .env.example .env.local      # Windows: copy .env.example .env.local
# Edite NEXT_PUBLIC_API_URL se a API não estiver em localhost:3333

npm run dev                     # http://localhost:3000
```

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_API_URL` | **sim** | URL pública da API Fastify (ex.: `http://localhost:3333`). |

## Scripts

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Servidor de desenvolvimento (Turbopack). |
| `npm run build` | Build de produção. |
| `npm start` | Servidor de produção (após o build). |
| `npm run lint` | ESLint 9 (`eslint-config-next`). |
| `npx tsc --noEmit` | Verificação de tipos. |

## Estrutura

```text
client/
├── components/          # Header, Footer, ProductCard/List, componentes do admin
├── context/             # AuthContext e CartContext (estado global + localStorage)
├── lib/                 # Cliente HTTP (api.ts), formatadores e labels
├── pages/               # Rotas — Pages Router
│   ├── index.tsx        # Catálogo com busca, filtros e ordenação
│   ├── product/[slug].tsx
│   ├── category/[slug].tsx
│   ├── cart.tsx
│   ├── checkout.tsx
│   ├── checkout/pix.tsx
│   ├── checkout/card.tsx
│   ├── orders.tsx
│   ├── order/[id].tsx
│   ├── profile.tsx
│   ├── login.tsx / register.tsx
│   ├── admin/           # Dashboard, pedidos, produtos e categorias
│   └── api/health.ts    # Health check do frontend
├── styles/globals.css   # Tailwind CSS 4
├── types/index.ts       # Tipos compartilhados
├── next.config.ts       # Domínios de imagem e turbopack root
└── vercel.json          # Configuração de deploy
```

## Funcionalidades

### Cliente

- Catálogo com busca, filtro por categoria/faixa de preço, ordenação e paginação.
- Página de produto com imagem 1:1 e controle de quantidade.
- Carrinho persistido em `localStorage`.
- Cadastro/login com JWT (access + refresh) e renovação automática no `api.ts`.
- Perfil com dados da conta e CRUD de endereços.
- Checkout com ViaCEP, cotação PAC/SEDEX e resumo de valores.
- Histórico e detalhes de pedidos com status, pagamento e rastreio.
- Pix com QR Code, copia-e-cola e polling até a confirmação.
- Cartão em modo demonstração (aprovação automática).

### Administrador

- Dashboard com receita, pedidos por status, ticket médio, estoque e gráfico de 7 dias.
- CRUD de produtos com ativação/desativação e soft delete.
- Cadastro e listagem de categorias.
- Listagem de todos os pedidos com filtros e paginação.
- Atualização de status (`SHIPPED`, `DELIVERED`, `CANCELED`) e código de rastreio.

## Integração com a API

O wrapper em [`lib/api.ts`](lib/api.ts):

- prefixa `NEXT_PUBLIC_API_URL`;
- adiciona `Authorization: Bearer <token>` quando há sessão;
- envia `Content-Type: application/json` apenas quando existe corpo;
- em `401`, renova o access token com o refresh token e repete a requisição uma vez.

## Credenciais de teste

Criadas pelo seed da API (`cd ../server && npm run prisma:seed`):

| Perfil | E-mail | Senha |
| :--- | :--- | :--- |
| Administrador | `admin@ecommerce.com` | `admin123` |
| Cliente | `cliente@teste.com` | `cliente123` |

## Deploy

O frontend está preparado para a **Vercel** com [`vercel.json`](vercel.json):

1. Importe o repositório na Vercel.
2. Configure **Root Directory = `client`**.
3. Defina `NEXT_PUBLIC_API_URL` com a URL pública da API.
4. Faça o deploy (a Vercel detecta Next.js automaticamente).

Alternativa Netlify: base `client`, build `npm run build`, plugin `@netlify/plugin-nextjs` e a mesma variável de ambiente.

## Limitações

- A tokenização de cartão é **simulada**; o modo real exige o SDK/Checkout Bricks do Mercado Pago.
- O frete é calculado por regras internas (simulado), não por transportadora real.
- O refresh token é armazenado em `localStorage` (o ideal seria cookie `HttpOnly`).
