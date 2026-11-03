# TechStore - Frontend

Uma plataforma de e-commerce moderna desenvolvida com Next.js 16, React e Tailwind CSS.

## 🚀 Tecnologias

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Lucide Icons**

## 📁 Estrutura de Arquivos

```
client/
├── pages/              # Rotas da aplicação
│   ├── index.tsx       # Página inicial - Catálogo de produtos
│   ├── login.tsx       # Tela de login
│   ├── register.tsx    # Tela de cadastro
│   ├── cart.tsx        # Carrinho de compras
│   ├── checkout.tsx    # Checkout
│   ├── checkout/pix.tsx      # Pagamento Pix
│   ├── checkout/card.tsx     # Pagamento Cartão
│   ├── orders.tsx      # Meus pedidos
│   ├── order/[id].tsx  # Detalhes do pedido
│   ├── profile.tsx     # Perfil do usuário
│   ├── category/[slug].tsx  # Página de categoria
│   ├── admin/index.tsx # Painel administrativo
│   ├── success.tsx     # Página de sucesso
│   ├── 404.tsx         # Página 404
│   └── 500.tsx         # Página 500
├── components/         # Componentes React
│   ├── Header.tsx      # Cabeçalho com navegação
│   ├── Footer.tsx      # Rodapé
│   ├── ProductCard.tsx # Card de produto
│   ├── ProductList.tsx # Lista de produtos
│   └── LoadingSpinner.tsx # Spinner de carregamento
├── context/            # Contextos globais
│   ├── AuthContext.tsx # Contexto de autenticação
│   └── CartContext.tsx # Contexto do carrinho
├── lib/                # Utilitários
│   └── api.ts          # Cliente API centralizado
├── types/              # Tipagens TypeScript
│   └── index.ts        # Tipos compartilhados
└── styles/             
    └── globals.css     # Estilos globais
```

## 🚀 Como Executar

### Requisitos
- Node.js 18+ 
- npm/yarn/pnpm

### Configuração

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd E-commerce/client
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.local - ../.env.example
# Edite NEXT_PUBLIC_API_URL com a URL do seu backend
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse em [http://localhost:3000](http://localhost:3000)

### Scripts disponíveis

- `npm run dev` - Desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Servidor de produção
- `npm run lint` - Linter ESLint

## 🔧 Configuração da API

O cliente se comunica com o backend através de `lib/api.ts`. 

Configure a URL da API no arquivo `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3333
```

## 🛒 Funcionalidades

### Para o Cliente
- ✅ Catálogo de produtos com busca e filtros
- ✅ Detalhes do produto
- ✅ Carrinho de compras com persistência local
- ✅ Checkout com Pix e Cartão de Crédito
- ✅ Histórico de pedidos
- ✅ Perfil do usuário
- ✅ Autenticação com JWT

### Para o Administrador
- ✅ Painel de administração
- ✅ Visão de todos os pedidos
- ✅ Atualização de status de pedidos

## 🎨 Estilização

O projeto utiliza Tailwind CSS com um design limpo e moderno:
- Layout responsivo
- Tema indigo/violeta
- Estados de foco acessíveis
- Transições suaves

## 📚 API Reference

- `GET /api/products` - Listar produtos (filtros: categoryId, search)
- `GET /api/products/:slug` - Detalhes do produto
- `GET /api/categories` - Listar categorias
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/addresses` - Listar endereços
- `POST /api/addresses` - Criar endereço
- `POST /api/orders` - Criar pedido
- `GET /api/orders/my` - Meus pedidos
- `GET /api/orders/:id` - Detalhes do pedido

## 🧪 Credenciais de Teste

**Admin:**
- Email: `admin@ecommerce.com`
- Senha: `admin123`

**Cliente:**
- Email: `cliente@teste.com`
- Senha: `cliente123`

## 🚀 Deploy

O frontend pode ser deployado em Vercel com um clique:

[![Vercel](https://vercel.com/button)](https://vercel.com)

O deploy automático detecta automaticamente a URL correta do backend.