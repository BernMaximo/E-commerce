# Arquitetura do Sistema

Este documento descreve a topologia de componentes, fluxo de dados e integrações da plataforma de e-commerce.

---

## 1. Visão Geral da Arquitetura

A aplicação é desenhada como uma solução moderna orientada a serviços desacoplados em um monorepo:

```mermaid
flowchart TB
    subgraph Frontend ["Frontend (Next.js 14+ / React)"]
        UI["Web App (App Router)"]
        CartState["Cart State (LocalStorage / Context)"]
        AuthContext["Auth Context & Token Handler"]
    end

    subgraph Backend ["Backend API (Node.js / Fastify / TypeScript)"]
        Router["HTTP Router & Middleware (RBAC / JWT)"]
        Controller["Controllers"]
        Service["Services (Regras de Negócio)"]
        Prisma["Prisma ORM"]
    end

    subgraph Database ["Persistência de Dados"]
        Postgres[(PostgreSQL Supabase / Neon)]
    end

    subgraph External ["Serviços Externos"]
        MercadoPago["Mercado Pago (Sandbox API & Webhooks)"]
        ViaCEP["ViaCEP API (Consulta de Endereço)"]
        ShippingEngine["Mecanismo de Frete (Simulado / Melhor Envio)"]
    end

    UI -->|Requisições HTTP / REST| Router
    Router --> Controller
    Controller --> Service
    Service --> Prisma
    Prisma --> Postgres

    Service -->|Criar Cobrança Pix/Cartão| MercadoPago
    MercadoPago -->|Notificação Webhook POST| Router

    UI -->|Autocomplete CEP| ViaCEP
    Service -->|Cotação de Frete (Peso/Dimensão)| ShippingEngine
```

---

## 2. Camadas da API REST (`/server`)

A API segue o princípio da **Separação de Preocupações (SoC)** e arquitetura limpa em camadas:

1. **Routes & Schemas**:
   * Definição das rotas com validação de entrada estrita (utilizando Zod ou JSON Schema nativo do Fastify).
   * Middleware de autenticação JWT e autorização RBAC (`verifyJwt`, `verifyRole('admin')`).
2. **Controllers**:
   * Recebem o `FastifyRequest` e `FastifyReply`.
   * Extraem parâmetros (`params`, `query`, `body`), repassam para os Services e formatam a resposta HTTP adequada (200, 201, 400, 404, 500).
3. **Services**:
   * Concentram as regras de negócio puras (ex: cálculo de totais, validação de disponibilidade de estoque, criação atômica de pedidos, integração com gateway de pagamento).
4. **Repositories / ORM Layer (Prisma)**:
   * Interface de persistência com o banco PostgreSQL.
   * Execução de transações relacionais atômicas (`prisma.$transaction`).

---

## 3. Estratégia de Autenticação e Segurança (JWT & RBAC)

* **Tokens**:
  * **Access Token**: JWT com tempo de expiração curto (ex: 15 minutos), enviado no header `Authorization: Bearer <token>`.
  * **Refresh Token**: Token de renovação com tempo de vida maior (ex: 7 dias) armazenado em cookie seguro `HttpOnly` ou endpoint de renovação.
* **Senhas**:
  * Criptografia unidirecional com `bcrypt` (fator de custo 10 ou 12) ou `argon2`. Senhas em texto puro nunca chegam à camada de persistência.
* **Controle de Acesso Baseado em Papéis (RBAC)**:
  * Papel `client`: Permissão para visualizar catálogo, criar pedidos próprios, gerenciar seus endereços e consultar seu histórico.
  * Papel `admin`: Permissão total para criar/editar produtos, alterar estoque, visualizar todos os pedidos de todos os clientes e despachar encomendas com inserção de código de rastreamento.

---

## 4. Integrações Externas

### 4.1. Mercado Pago (Modo Sandbox)
* **Geração de Cobrança Pix**:
  * A API envia o valor total e dados do cliente para a rota `/v1/payments` do Mercado Pago informando `payment_method_id: 'pix'`.
  * O retorno contém a string do código copia e cola (`point_of_interaction.transaction_data.qr_code`) e imagem do QR code (`qr_code_base64`).
* **Cartão de Crédito**:
  * O cliente insere os dados no frontend utilizando tokenização segura via SDK Mercado Pago JS. O backend recebe apenas o `token` de pagamento, sem nunca ter contato com os números reais do cartão (em conformidade com PCI-DSS).
* **Webhooks Receptores**:
  * Endpoint público no backend `POST /webhooks/mercadopago` que recebe notificações assíncronas de alteração de pagamento e atualiza a tabela `payments` e o status de `orders`.

### 4.2. Consulta de Endereço (ViaCEP)
* Chamada a `https://viacep.com.br/ws/{cep}/json/` para preenchimento imediato de Logradouro, Bairro, Cidade e UF ao digitar o CEP no checkout.

### 4.3. Motor de Cálculo de Frete
* Consulta baseada na distância da UF de destino e peso/dimensões acumuladas dos produtos do carrinho:
  $$\text{Frete} = \text{Taxa Base UF} + (\text{Peso Total em kg} \times \text{Valor por kg})$$
* Retorna opções de entrega (ex: PAC e Sedex simulados com prazo e valor).

