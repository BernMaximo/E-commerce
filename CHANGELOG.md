# Changelog

Todas as mudanças significativas deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-br/1.0.0/),
e este projeto adota a [Semantic Versioning](https://semver.org/pt-br/spec/v2.0.0.html).

## [Não lançado]

### Adicionado
- Painel administrativo completo e responsivo
  - Dashboard com receita, ticket médio, pedidos por status, vendas dos últimos 7 dias e alertas de estoque
  - Gestão de pedidos com busca, filtro por status, paginação, detalhes e atualização de status/rastreio
  - Gestão de produtos com busca, filtros, paginação, cadastro/edição e ativação/desativação
  - Gestão de categorias com criação e contagem de produtos
- Endpoint `GET /api/admin/stats` com indicadores do backoffice
- Endpoint `GET /api/products/admin/all` para listar produtos ativos e inativos
- Busca por número do pedido, cliente ou e-mail em `GET /api/orders/admin/all`
- Atalho para o painel administrativo no header e redirecionamento de administradores após o login

## [1.0.0] - 2026-11-02

### Adicionado
- Backend completo com Fastify e Prisma ORM
- Sistema de autenticação JWT com refresh tokens
- CRUD de categorias e produtos
- Carrinho de compras com persistência local
- Catálogo de produtos com busca e filtros
- Checkout com Pix dinâmico (sandbox)
- Integração Mercado Pago (Pix e Cartão)
- Webhooks para atualização de status de pagamento
- Integração ViaCEP para busca de endereços
- Cálculo de frete baseado em peso e dimensões
- Frontend com Next.js 16 e Tailwind CSS
- Páginas: Home, Login, Register, Cart, Checkout
- Contextos de autenticação e carrinho
- Componentes reutilizáveis (Header, Footer, ProductCard, etc.)
- Documentação completa em `/docs`
  - Arquitetura do sistema
  - Fluxos de usuário
  - Modelo de dados (DER)
  - Dicionário de dados

### Configurado
- ESLint e Prettier
- TypeScript configurado
- Scripts de build e dev
- Seed de desenvolvimento com usuários de teste
- Variáveis de ambiente

### Testado
- Funcionalidade de login/logout
- Registro de novos usuários
- Adição de itens ao carrinho
- Criação de pedidos
- Geração de QR Code Pix

## [0.1.0] - 2026-10-28

### Adicionado
- Inicialização do projeto monorepo
- Estrutura de pastas
- Configuração do backend com Fastify
- Configuração do frontend com Next.js
- Banco de dados PostgreSQL com Prisma
- Documentação inicial