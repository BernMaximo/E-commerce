# Dicionário de Dados

Este documento fornece a especificação técnica detalhada de cada tabela, coluna, restrição e regra de validação do banco de dados relacional.

---

## 1. Tabela: `users`
Armazena as credenciais e dados cadastrais dos clientes e administradores do sistema.

| Coluna | Tipo SQL | Nulo? | Padrão / Restrição | Descrição |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Não | `PRIMARY KEY DEFAULT gen_random_uuid()` | Identificador universal único do usuário. |
| `name` | `VARCHAR(150)` | Não | - | Nome completo do usuário. |
| `email` | `VARCHAR(255)` | Não | `UNIQUE` | E-mail corporativo ou pessoal para login. |
| `password_hash` | `VARCHAR(255)` | Não | - | Hash criptográfico da senha (gerado com bcrypt/argon2). |
| `role` | `VARCHAR(20)` | Não | `'client'`, `CHECK (role IN ('client', 'admin'))` | Papel de acesso para controle RBAC. |
| `created_at` | `TIMESTAMPTZ` | Não | `CURRENT_TIMESTAMP` | Data e hora de criação da conta. |
| `updated_at` | `TIMESTAMPTZ` | Não | `CURRENT_TIMESTAMP` | Data e hora da última alteração de cadastro. |

---

## 2. Tabela: `addresses`
Endereços de entrega associados aos usuários da plataforma.

| Coluna | Tipo SQL | Nulo? | Padrão / Restrição | Descrição |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Não | `PRIMARY KEY DEFAULT gen_random_uuid()` | Identificador universal único do endereço. |
| `user_id` | `UUID` | Não | `REFERENCES users(id) ON DELETE CASCADE` | Usuário proprietário deste endereço. |
| `recipient_name`| `VARCHAR(150)`| Não | - | Nome da pessoa autorizada a receber a encomenda. |
| `zipcode` | `VARCHAR(9)` | Não | - | CEP brasileiro (ex: 01001-000). |
| `street` | `VARCHAR(255)` | Não | - | Logradouro (Rua, Avenida, etc.). |
| `number` | `VARCHAR(20)` | Não | - | Número do imóvel ou 'S/N'. |
| `complement` | `VARCHAR(100)` | Sim | `NULL` | Apartamento, bloco, sala, etc. |
| `neighborhood` | `VARCHAR(100)` | Não | - | Bairro. |
| `city` | `VARCHAR(100)` | Não | - | Cidade. |
| `state` | `VARCHAR(2)` | Não | - | Sigla da Unidade Federativa (UF, ex: 'SP'). |
| `is_default` | `BOOLEAN` | Não | `FALSE` | Indica se é o endereço preferencial de entrega. |
| `created_at` | `TIMESTAMPTZ` | Não | `CURRENT_TIMESTAMP` | Data de cadastro do endereço. |
| `updated_at` | `TIMESTAMPTZ` | Não | `CURRENT_TIMESTAMP` | Data da última atualização do endereço. |

---

## 3. Tabela: `categories`
Categorias organizacionais dos produtos disponíveis na loja.

| Coluna | Tipo SQL | Nulo? | Padrão / Restrição | Descrição |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Não | `PRIMARY KEY DEFAULT gen_random_uuid()` | Identificador universal único da categoria. |
| `name` | `VARCHAR(100)` | Não | - | Nome exibido (ex: "Smartphones", "Periféricos"). |
| `slug` | `VARCHAR(120)` | Não | `UNIQUE` | Identificador amigável para URLs (ex: `smartphones`). |
| `active` | `BOOLEAN` | Não | `TRUE` | Permite ocultar a categoria e seus produtos do menu. |
| `created_at` | `TIMESTAMPTZ` | Não | `CURRENT_TIMESTAMP` | Data de cadastro da categoria. |

---

## 4. Tabela: `products`
Catálogo de mercadorias com dados comerciais, estoque e dimensões logísticas.

| Coluna | Tipo SQL | Nulo? | Padrão / Restrição | Descrição |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Não | `PRIMARY KEY DEFAULT gen_random_uuid()` | Identificador universal único do produto. |
| `category_id` | `UUID` | Não | `REFERENCES categories(id) ON DELETE RESTRICT`| Categoria principal à qual o produto pertence. |
| `name` | `VARCHAR(255)` | Não | - | Título comercial do produto. |
| `slug` | `VARCHAR(280)` | Não | `UNIQUE` | Slug para roteamento SEO (ex: `teclado-mecanico-rgb`). |
| `description` | `TEXT` | Sim | `NULL` | Descrição rica / especificações do produto. |
| `price` | `DECIMAL(10, 2)`| Não | `CHECK (price >= 0)` | Preço atual de venda na loja. |
| `stock` | `INT` | Não | `0`, `CHECK (stock >= 0)` | Quantidade de unidades disponíveis para venda. |
| `image_url` | `TEXT` | Não | - | URL pública da imagem principal do produto. |
| `weight_g` | `INT` | Não | `300`, `CHECK (weight_g > 0)` | Peso bruto em gramas (usado no cálculo de frete). |
| `length_cm` | `INT` | Não | `20`, `CHECK (length_cm > 0)` | Comprimento da embalagem em centímetros. |
| `width_cm` | `INT` | Não | `15`, `CHECK (width_cm > 0)` | Largura da embalagem em centímetros. |
| `height_cm` | `INT` | Não | `10`, `CHECK (height_cm > 0)` | Altura da embalagem em centímetros. |
| `active` | `BOOLEAN` | Não | `TRUE` | Soft delete: define se o produto aparece no catálogo. |
| `created_at` | `TIMESTAMPTZ` | Não | `CURRENT_TIMESTAMP` | Data de inclusão do produto. |
| `updated_at` | `TIMESTAMPTZ` | Não | `CURRENT_TIMESTAMP` | Data da última alteração de cadastro/preço. |

---

## 5. Tabela: `orders`
Registro de vendas e estado de processamento das compras.

| Coluna | Tipo SQL | Nulo? | Padrão / Restrição | Descrição |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Não | `PRIMARY KEY DEFAULT gen_random_uuid()` | Identificador primário do pedido. |
| `order_number`| `VARCHAR(20)` | Não | `UNIQUE` | Código amigável para exibição ao cliente (ex: `PED-2024-001`). |
| `user_id` | `UUID` | Não | `REFERENCES users(id) ON DELETE RESTRICT` | Comprador do pedido. |
| `address_id` | `UUID` | Não | `REFERENCES addresses(id) ON DELETE RESTRICT` | Endereço onde o pedido deverá ser entregue. |
| `status` | `VARCHAR(20)` | Não | `'pending'`, `CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'canceled'))` | Status do ciclo de vida da compra. |
| `subtotal` | `DECIMAL(10, 2)`| Não | `CHECK (subtotal >= 0)` | Soma do valor de todos os itens do pedido. |
| `shipping_cost`| `DECIMAL(10, 2)`| Não | `0.00`, `CHECK (shipping_cost >= 0)` | Valor cobrado pelo frete. |
| `total` | `DECIMAL(10, 2)`| Não | `CHECK (total >= 0)` | Valor total final (`subtotal + shipping_cost`). |
| `tracking_code`| `VARCHAR(60)` | Sim | `NULL` | Código de rastreio informado pelo admin após despacho. |
| `created_at` | `TIMESTAMPTZ` | Não | `CURRENT_TIMESTAMP` | Data e hora em que a compra foi solicitada. |
| `updated_at` | `TIMESTAMPTZ` | Não | `CURRENT_TIMESTAMP` | Data e hora da última mudança de status do pedido. |

---

## 6. Tabela: `order_items`
Itens associados a um pedido com congelamento de valores (*Price Snapshot Pattern*).

| Coluna | Tipo SQL | Nulo? | Padrão / Restrição | Descrição |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Não | `PRIMARY KEY DEFAULT gen_random_uuid()` | Identificador primário da linha do item. |
| `order_id` | `UUID` | Não | `REFERENCES orders(id) ON DELETE CASCADE` | Pedido ao qual este item pertence. |
| `product_id` | `UUID` | Não | `REFERENCES products(id) ON DELETE RESTRICT`| Referência ao produto catalogado. |
| `product_name`| `VARCHAR(255)`| Não | - | **Snapshot**: Nome do produto no ato da compra. |
| `quantity` | `INT` | Não | `CHECK (quantity > 0)` | Quantidade comprada deste item. |
| `unit_price` | `DECIMAL(10, 2)`| Não | `CHECK (unit_price >= 0)` | **Snapshot**: Preço unitário pago no ato da compra. |
| `subtotal` | `DECIMAL(10, 2)`| Não | `CHECK (subtotal >= 0)` | Multiplicação de `quantity * unit_price`. |

---

## 7. Tabela: `payments`
Dados do processamento de pagamento via gateway (Mercado Pago).

| Coluna | Tipo SQL | Nulo? | Padrão / Restrição | Descrição |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | Não | `PRIMARY KEY DEFAULT gen_random_uuid()` | Identificador primário do pagamento. |
| `order_id` | `UUID` | Não | `UNIQUE, REFERENCES orders(id) ON DELETE CASCADE` | Pedido associado a esta transação. |
| `payment_method`| `VARCHAR(20)`| Não | `CHECK (payment_method IN ('pix', 'credit_card'))` | Método escolhido pelo cliente. |
| `status` | `VARCHAR(20)` | Não | `'pending'`, `CHECK (status IN ('pending', 'approved', 'rejected', 'refunded'))` | Status de liquidação retornado pelo gateway. |
| `transaction_id`| `VARCHAR(120)`| Sim | `NULL` | ID externo da transação retornado pela API do gateway. |
| `qr_code_pix` | `TEXT` | Sim | `NULL` | String do código Pix "Copia e Cola" (EMV). |
| `qr_code_pix_url`| `TEXT` | Sim | `NULL` | Imagem/URL do QR Code Pix renderizável. |
| `raw_response` | `JSONB` | Sim | `NULL` | Resposta JSON integral enviada pelo gateway para auditoria. |
| `paid_at` | `TIMESTAMPTZ` | Sim | `NULL` | Timestamp da confirmação do pagamento. |
| `created_at` | `TIMESTAMPTZ` | Não | `CURRENT_TIMESTAMP` | Data de geração da cobrança. |
| `updated_at` | `TIMESTAMPTZ` | Não | `CURRENT_TIMESTAMP` | Data do último webhook de atualização. |

---

## 8. Padrões Arquiteturais Fundamentais

### 1. Padrão de Congelamento de Preço (*Snapshot Pattern*)
Nunca calcule o valor de pedidos passados lendo o campo `products.price`. O preço dos produtos sofre reajustes ao longo do tempo. O campo `order_items.unit_price` e `order_items.product_name` garante que a nota do pedido permaneça financeiramente e juridicamente idêntica ao momento em que a compra foi fechada.

### 2. Tratamento Monetário
Valores monetários **jamais** devem ser armazenados como `FLOAT` ou `REAL` devido a imprecisões de ponto flutuante IEEE 754. O tipo `DECIMAL(10, 2)` (ou `NUMERIC(10, 2)`) assegura precisão exata para centavos.

### 3. Idempotência em Webhooks
O webhook do Mercado Pago pode enviar a mesma notificação mais de uma vez (at-least-once delivery). O campo `payments.transaction_id` com índice rápido permite verificar se a notificação já foi processada, evitando alterações duplicadas de status e baixa indevida em estoque.

