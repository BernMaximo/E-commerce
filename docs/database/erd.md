# Diagrama de Entidade-Relacionamento (DER)

Este documento detalha o modelo conceitual e lógico do banco de dados relacional (PostgreSQL) do projeto de E-commerce.

---

## 1. Diagrama Visual (Mermaid)

```mermaid
erDiagram
    users ||--o{ addresses : "possui (1:N)"
    users ||--o{ orders : "realiza (1:N)"
    categories ||--o{ products : "agrupa (1:N)"
    orders ||--|{ order_items : "contém (1:N)"
    products ||--o{ order_items : "é item de (1:N)"
    orders ||--|| payments : "liquidado por (1:1)"
    addresses ||--o{ orders : "recebe entrega (1:N)"

    users {
        uuid id PK
        string name
        string email UK
        string password_hash
        string role "client | admin"
        timestamp created_at
        timestamp updated_at
    }

    addresses {
        uuid id PK
        uuid user_id FK
        string recipient_name
        string zipcode
        string street
        string number
        string complement
        string neighborhood
        string city
        string state
        boolean is_default
        timestamp created_at
        timestamp updated_at
    }

    categories {
        uuid id PK
        string name
        string slug UK
        boolean active
        timestamp created_at
    }

    products {
        uuid id PK
        uuid category_id FK
        string name
        string slug UK
        text description
        decimal price
        int stock
        string image_url
        int weight_g
        int length_cm
        int width_cm
        int height_cm
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    orders {
        uuid id PK
        string order_number UK
        uuid user_id FK
        uuid address_id FK
        string status "pending | paid | shipped | delivered | canceled"
        decimal subtotal
        decimal shipping_cost
        decimal total
        string tracking_code
        timestamp created_at
        timestamp updated_at
    }

    order_items {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        string product_name
        int quantity
        decimal unit_price
        decimal subtotal
    }

    payments {
        uuid id PK
        uuid order_id FK, UK
        string payment_method "pix | credit_card"
        string status "pending | approved | rejected | refunded"
        string transaction_id
        text qr_code_pix
        text qr_code_pix_url
        jsonb raw_response
        timestamp paid_at
        timestamp created_at
        timestamp updated_at
    }
```

---

## 2. Cardinalidades e Justificativas de Relacionamento

| Relacionamento | Tipo | Descrição e Justificativa de Negócio |
| :--- | :---: | :--- |
| `users` $\rightarrow$ `addresses` | **1 : N** | Um usuário pode ter múltiplos endereços salvos (ex: Casa, Trabalho). Apenas um deles pode ser marcado como padrão (`is_default = true`). |
| `users` $\rightarrow$ `orders` | **1 : N** | Um usuário pode realizar vários pedidos ao longo do tempo. O histórico de compras fica associado ao `user_id`. |
| `addresses` $\rightarrow$ `orders` | **1 : N** | Um endereço cadastrado pode ser reutilizado em diferentes pedidos. |
| `categories` $\rightarrow$ `products` | **1 : N** | Cada produto pertence a uma categoria principal para facilitar a taxonomia, buscas e filtragem no catálogo. |
| `orders` $\rightarrow$ `order_items` | **1 : N** | Um pedido contém 1 ou mais itens comprados. A tabela `order_items` atua como relação N:N resolvida entre `orders` e `products`. |
| `products` $\rightarrow$ `order_items` | **1 : N** | Um produto pode aparecer em diversos pedidos de clientes distintos. |
| `orders` $\rightarrow$ `payments` | **1 : 1** | No escopo do MVP, cada pedido possui uma única tentativa/registro de pagamento ativa vinculada à transação do gateway. |

---

## 3. Regras de Integridade Referencial

* **`ON DELETE CASCADE`**:
  * `addresses` $\rightarrow$ deletado se o `user` for deletado.
  * `order_items` $\rightarrow$ deletados automaticamente se o `order` for deletado (limpeza de integridade de pedido).
  * `payments` $\rightarrow$ deletado se o `order` for deletado.
* **`ON DELETE RESTRICT`**:
  * `products` $\rightarrow$ **proibido deletar** um produto se ele já constar em algum `order_items`. Isso impede a corrupção do histórico contábil de compras. Se o administrador não quiser mais vender o produto, ele deve apenas desativá-lo (`active = false`).
  * `users` e `addresses` $\rightarrow$ **proibido deletar** caso possuam vínculos com pedidos já efetuados (`orders`).

