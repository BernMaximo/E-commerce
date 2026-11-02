# Fluxos de Usuário (User Flows)

Este documento mapeia as jornadas e fluxos de navegação dos usuários nas visões de **Cliente** e de **Administrador**.

---

## 1. Fluxo Completo do Cliente (Jornada de Compra)

```mermaid
flowchart TD
    Start([Visitante acessa a Loja]) --> Home[1. Home / Catálogo de Produtos]
    
    Home -->|Busca por texto ou clica em Categoria| SearchList[Listagem Filtrada]
    SearchList -->|Clica em um card| PDP[2. Página do Produto - PDP]
    Home -->|Clica direto em um card| PDP

    PDP -->|Digita CEP| CalcShipping[Cálculo de Frete e Prazo]
    PDP -->|Seleciona Qtd e Clica em Comprar| Cart[3. Carrinho de Compras]

    Cart -->|Atualiza Qtd ou Remove Item| Cart
    Cart -->|Clica em Continuar Compra| CheckAuth{Usuário logado?}

    CheckAuth -->|Não| LoginModal[Tela de Login / Cadastro Rápido]
    LoginModal -->|Autenticado| Checkout[4. Checkout Transparente]
    CheckAuth -->|Sim| Checkout

    Checkout -->|Passo 1: Endereço| AddrStep[Selecionar / Cadastrar Endereço]
    AddrStep -->|Passo 2: Pagamento| PayStep{Forma de Pagamento?}

    PayStep -->|Pix| GenPix[Gerar QR Code Pix e Copia-e-Cola]
    PayStep -->|Cartão de Crédito| TokenizeCard[Tokenizar Dados do Cartão]

    GenPix --> WaitPay[Tela de Sucesso e Aguardo de Pagamento]
    TokenizeCard --> WaitPay

    WaitPay -->|Pagamento Confirmado| OrderDetail[5. Detalhes do Pedido & Rastreio]
    OrderDetail --> End([Pedido Entregue])
```

---

## 2. Fluxo do Administrador (Backoffice Operacional)

```mermaid
flowchart TD
    AdminStart([Administrador acessa /admin]) --> AdminAuth{Verificação de Papel: role == 'admin'}

    AdminAuth -->|Não autorizado| Denied[Acesso Negado 403 / Redirecionamento]
    AdminAuth -->|Autorizado| AdminDash[Painel Principal / Dashboard]

    AdminDash --> CatalogMgmt[Gestão de Produtos]
    AdminDash --> OrderMgmt[Gestão de Pedidos]

    subgraph "Ações de Catálogo"
        CatalogMgmt --> NewProd[Cadastrar Novo Produto]
        CatalogMgmt --> EditProd[Editar Preço, Descrição e Estoque]
        CatalogMgmt --> ToggleActive[Ativar / Desativar Produto]
    end

    subgraph "Ações de Pedidos"
        OrderMgmt --> FilterOrders[Filtrar Pedidos: Pendente, Pago, Enviado]
        OrderMgmt --> ViewOrder[Visualizar Detalhes e Itens]
        ViewOrder --> SetTracking[Inserir Código de Rastreio dos Correios]
        SetTracking --> UpdateStatus[Alterar Status para 'Enviado']
    end
```
