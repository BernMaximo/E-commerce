# Especificações de Telas e Wireframes Estruturais

Este documento define os componentes visuais, hierarquia de informações e estados de interface para o MVP do E-commerce.

---

## 1. Tela: Home / Catálogo (`/`)

### Layout Estrutural (Wireframe)
```
+-----------------------------------------------------------------------------------------+
| [ LOGO ]       [ Buscar produtos... (Debounce 300ms) ]       [ Minha Conta ] [ Carrinho (3) ] |
+-----------------------------------------------------------------------------------------+
| [ Categorias: Todos | Smartphones | Periféricos | Hardware | Acessórios ]               |
+-----------------------------------------------------------------------------------------+
| [ BANNER PROMOCIONAL / DESTAQUES COM CARROSSEL DE PRODUTOS EM OFERTA ]                  |
+-----------------------------------------------------------------------------------------+
| FILTROS                   | GRADE DE PRODUTOS                    [ Ordenar por: Preço v ] |
|                           +------------------+  +------------------+  +------------------+
| Categoria:                | [ IMG PRODUTO ]  |  | [ IMG PRODUTO ]  |  | [ IMG PRODUTO ]  |
| [ ] Periféricos           | Teclado Mecânico |  | Mouse Gamer      |  | Headset Pro      |
| [ ] Smartphones           | R$ 299,90        |  | R$ 149,90        |  | R$ 389,90        |
|                           | [ Ver Detalhes ] |  | [ Ver Detalhes ] |  | [ Ver Detalhes ] |
| Faixa de Preço:           +------------------+  +------------------+  +------------------+
| [ R$ Min ] - [ R$ Max ]   | [ IMG PRODUTO ]  |  | [ IMG PRODUTO ]  |  | [ IMG PRODUTO ]  |
|                           | ...              |  | ...              |  | ...              |
+-----------------------------------------------------------------------------------------+
| FOOTER: Links institucionais, Formas de pagamento aceitas (Pix, Cartões), Direitos.    |
+-----------------------------------------------------------------------------------------+
```

### Elementos e Comportamentos:
* **Barra de Busca**: Acionamento com debounce de 300ms para evitar requisições a cada tecla.
* **Filtros Laterais**: Filtro combinado de categorias e preço mínimo/máximo com atualização reativa da lista.
* **Cards de Produto**: Mostram imagem otimizada, título truncado em 2 linhas, badge de "Esgotado" caso `stock == 0` e preço formatado em Real (`pt-BR`).

---

## 2. Tela: Detalhes do Produto - PDP (`/products/:slug`)

### Layout Estrutural (Wireframe)
```
+-----------------------------------------------------------------------------------------+
| [ HEADER / NAVBAR ]                                                                     |
+-----------------------------------------------------------------------------------------+
| Home > Periféricos > Teclado Mecânico RGB                                               |
|                                                                                         |
|  +-------------------------+    # Teclado Mecânico Switch Blue RGB                     |
|  |                         |    Avaliação: ★★★★★ (4.9/5) - 24 avaliações               |
|  |                         |                                                            |
|  |     IMAGEM PRINCIPAL    |    R$ 299,90 à vista no Pix                                |
|  |     DO PRODUTO          |    ou 6x de R$ 49,98 sem juros                             |
|  |                         |                                                            |
|  +-------------------------+    Disponibilidade: [ Em Estoque - 14 unidades ]           |
|  | [thumb1] [thumb2] [...] |                                                            |
|                                 Quantidade: [ - ] [ 1 ] [ + ]                           |
|                                 [ BOTÃO: ADICIONAR AO CARRINHO ]                        |
|                                                                                         |
|                                 Simular Frete e Prazo:                                  |
|                                 [ 01001-000 ] [ Calcular ]                              |
|                                 - PAC (5 dias úteis): R$ 18,50                          |
|                                 - Sedex (2 dias úteis): R$ 32,00                        |
+-----------------------------------------------------------------------------------------+
| DESCRIÇÃO COMPLETA DO PRODUTO:                                                          |
| Texto detalhado, especificações técnicas, peso (850g), dimensões (44x13x3 cm).          |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Tela: Carrinho de Compras (`/cart` ou Drawer lateral)

### Layout Estrutural (Wireframe)
```
+-----------------------------------------------------------------------------------------+
| Meu Carrinho (2 itens)                                                                  |
+-----------------------------------------------------------------------------------------+
| PRODUTO                     PREÇO UNIT.      QUANTIDADE      SUBTOTAL      AÇÃO         |
| [ IMG ] Teclado Mecânico     R$ 299,90       [ - ] 1 [ + ]   R$ 299,90     [ Excluir ]  |
| [ IMG ] Mouse Gamer 16000DPI R$ 149,90       [ - ] 2 [ + ]   R$ 299,80     [ Excluir ]  |
+-----------------------------------------------------------------------------------------+
| Calcular Frete: [ 01001-000 ] [ Calcular ]   | RESUMO DO PEDIDO                         |
| Sedex selecionado: R$ 25,00                  | Subtotal dos produtos:        R$ 599,70  |
|                                              | Frete estimado:               R$  25,00  |
|                                              | TOTAL:                        R$ 624,70  |
|                                              | [ BOTÃO: FINALIZAR COMPRA ]              |
+-----------------------------------------------------------------------------------------+
```

### Validações:
* O botão `+` deve ser desabilitado quando a quantidade selecionada atingir o `stock` disponível do produto.
* Caso um item tenha o estoque zerado enquanto estava no carrinho, exibir alerta visual recomendando a remoção.

---

## 4. Tela: Checkout Transparente (`/checkout`)

### Layout Estrutural (Wireframe)
```
+-----------------------------------------------------------------------------------------+
| CHECKOUT SEGURO                                                   Resumo do Pedido      |
+-----------------------------------------------------------------+-----------------------+
| PASSO 1: ENDEREÇO DE ENTREGA                                    | 2 itens no carrinho   |
| CEP: [ 01001-000 ] (Autocompleta via ViaCEP)                    | Subtotal:   R$ 599,70 |
| Rua: [ Praça da Sé                           ] Nº: [ 100      ] | Frete:      R$  25,00 |
| Bairro: [ Sé                ] Compl: [ Apto 42                ] | Total:      R$ 624,70 |
| Cidade: [ São Paulo         ] UF:    [ SP                     ] |                       |
| Nome do Destinatário: [ Gustavo Silva                         ] |                       |
+-----------------------------------------------------------------+                       |
| PASSO 2: FORMA DE PAGAMENTO                                     |                       |
| [ (o) PIX (Instantâneo) ]    [ ( ) CARTÃO DE CRÉDITO ]          |                       |
|                                                                 |                       |
|  * O código Pix será gerado na próxima tela após confirmar.     |                       |
|  * Desconto ou aprovação imediata em qualquer dia/horário.      |                       |
|                                                                 |                       |
| [ BOTÃO: CONFIRMAR E GERAR PEDIDO ]                             |                       |
+-----------------------------------------------------------------+-----------------------+
```

### Modal/Tela de Sucesso Pix:
* Exibe o QR Code dinâmico em tela com contador regressivo de 30 minutos.
* Botão com 1 clique para "Copiar Código Pix (Copia e Cola)".
* Polling leve ou escuta SSE/WebSocket no backend para redirecionar à tela de sucesso assim que o webhook do Mercado Pago acusar `status: 'paid'`.

---

## 5. Tela: Meus Pedidos & Rastreamento (`/account/orders`)

### Layout Estrutural (Wireframe)
```
+-----------------------------------------------------------------------------------------+
| Minha Conta > Histórico de Pedidos                                                      |
+-----------------------------------------------------------------------------------------+
| PEDIDO #PED-2024-001  |  Data: 02/11/2026 14:30  |  Total: R$ 624,70  |  Status: [ PAGO ]|
| Linha do Tempo: [ (✓) Criado ] ---> [ (✓) Pago ] ---> [ ( ) Enviado ] ---> [ ( ) Entregue]
| Itens: Teclado Mecânico (1x), Mouse Gamer (2x)                                          |
| Endereço: Praça da Sé, 100 - Apto 42, São Paulo - SP                                   |
| Código de Rastreio: [ AA123456789BR ] -> (Link direto de rastreio Correios)            |
+-----------------------------------------------------------------------------------------+
```

---

## 6. Telas Administrativas (Backoffice - `/admin`)

### Gestão de Produtos (`/admin/products`)
* Tabela com imagem em miniatura, Nome, Categoria, Preço, Quantidade em Estoque e Switch (Ativo/Inativo).
* Botão "Cadastrar Produto" que abre modal/formulário com:
  * Título, Slug automático gerado por título, Categoria (select).
  * Preço, Estoque, Dimensões de frete (Peso, Altura, Largura, Comprimento).
  * URL da imagem do produto (com preview imediato).

### Gestão de Pedidos (`/admin/orders`)
* Lista de todos os pedidos da loja com filtros por status (`Pendente`, `Pago`, `Enviado`, `Cancelado`).
* Visualização detalhada do comprador e endereço de entrega.
* Ação de despacho: Campo para digitação do `código de rastreio` e botão para transicionar status para `Enviado`.

