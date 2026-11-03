# Contribuindo com o TechStore

Obrigado por considerar contribuir para este projeto! 

## 📋 Regras do Projeto

### Estrutura
- Utilize TypeScript para novos arquivos
- Siga o padrão de nomenclatura PascalCase para componentes
- Use arrow functions com tipagem explícita

### Code Style
- Use prettier com as configurações do projeto
- Siga as convenções do ESLint
- Comente funções complexas

### Commit Messages
- Use formato Conventional Commits
- Exemplo: `feat: adiciona filtro de categoria`
- Exemplo: `fix: corrige cálculo do frete`

## 🚀 Como Começar

1. Fork o repositório
2. Clone seu fork localmente:
```bash
git clone https://github.com/seu-usuario/E-commerce.git
cd E-commerce
```

3. Crie uma branch para suas alterações:
```bash
git checkout -b feature/nova-funcionalidade
```

4. Instale as dependências:
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

5. Inicie os servidores de desenvolvimento:
```bash
# Backend
cd server
npm run dev

# Frontend (em outro terminal)
cd client
npm run dev
```

## 📦 Scripts

### Backend
```bash
npm run dev        # Desenvolvimento
npm run build      # Build
npm run prisma:migrate  # Migrações
npm run prisma:seed     # Seed do banco
```

### Frontend
```bash
npm run dev        # Desenvolvimento
npm run build      # Build
npm run start      # Servidor de produção
npm run lint       # Verificar code style
```

## 🧪 Testes

O projeto utiliza testes manuais para validação. Para testar:

1. Inicie o backend e frontend
2. Acesse http://localhost:3000
3. Use as credenciais de teste (veja README)

## 🤝 Contribuições

Sugestões são bem-vindas! Por favor, abra uma issue para discutir mudanças antes de enviar pull requests.