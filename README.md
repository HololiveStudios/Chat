# P2P Chat - Monorepositório Multiplataforma

Um sistema completo de chat P2P em tempo real que funciona em todas as plataformas principais.

## 🚀 Início Rápido

```bash
# Clone o repositório
git clone <repository-url>
cd p2p-chat-monorepo

# Instale todas as dependências
npm run install:all

# Configure as variáveis de ambiente
cp backend/.env.example backend/.env
cp web/.env.example web/.env

# Execute o banco de dados
cd backend && npx prisma db push && npx prisma db seed

# Inicie o desenvolvimento
npm run dev
```

## 📁 Estrutura do Projeto

```
monorepo/
├── backend/           # API Node.js + Express + Socket.io
├── web/              # Frontend React + Vite + TypeScript  
├── mobile/           # React Native + Expo
├── desktop/          # Electron + React
├── android/          # Android Nativo + Kotlin
├── shared/           # Tipos TypeScript compartilhados
└── docker-compose.yml
```

## 🛠️ Tecnologias

### Backend
- **Node.js** + Express + TypeScript
- **Socket.io** para WebSocket em tempo real
- **SQLite** + Prisma ORM
- **JWT** com refresh tokens
- **Rate limiting** (100 req/min)

### Frontend Web
- **React 18** + Vite + TypeScript
- **Tailwind CSS** com design system customizado
- **Socket.io Client** com reconexão automática
- Design dark responsivo

### Mobile
- **React Native** + Expo SDK 49+
- **Expo Router** para navegação
- **AsyncStorage** para cache offline
- **Expo Notifications** para push

### Desktop
- **Electron 27+** wrapper da versão web
- **Auto-updater** integrado
- Builds para Windows/macOS/Linux

### Android Nativo
- **Kotlin** + Jetpack Compose
- **Material 3** Dynamic Color
- **Retrofit** + OkHttp para HTTP
- **Socket.io Android** client

## 🎨 Design System

### Paleta de Cores
- **Background**: `#121212`
- **Mensagem Enviada**: `#1F1F1F`
- **Mensagem Recebida**: `#272727`
- **Accent**: `#4A90E2`
- **Texto Primário**: `#FFFFFF`

### Tipografia
- **Fonte**: Inter
- **Corpo**: 16px
- **Timestamps**: 12px
- **Nomes**: 14px

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Backend + Web
npm run dev:backend      # Apenas backend
npm run dev:web         # Apenas web
npm run dev:mobile      # Mobile (Expo)

# Build
npm run build:all       # Todas as plataformas
npm run build:web       # Web apenas
npm run build:desktop   # Desktop apenas

# Testes
npm run test:all        # Todos os testes
npm run test:backend    # Backend apenas
npm run test:web        # Web apenas

# Utilitários
npm run clean           # Limpar node_modules
npm run install:all     # Instalar todas as deps
```

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

**Backend** (`.env`):
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://10.0.11.150:5175
```

**Web** (`.env`):
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

### Docker Compose

```bash
# Iniciar todos os serviços
docker-compose up

# Apenas backend
docker-compose up backend

# Com rebuild
docker-compose up --build
```

## 🗃️ Banco de Dados

### Modelos Principais
- **User**: usuários do sistema
- **Room**: salas de chat (direct/group)
- **Message**: mensagens
- **RoomMember**: membros das salas

### Comandos Prisma
```bash
cd backend

# Gerar cliente
npx prisma generate

# Aplicar schema
npx prisma db push

# Seed dados exemplo
npx prisma db seed

# Interface visual
npx prisma studio
```

## 🔌 WebSocket Events

### Cliente → Servidor
- `join_room(roomId)`
- `send_message(data)`
- `typing_start({ roomId })`
- `typing_stop({ roomId })`

### Servidor → Cliente  
- `message_received(message)`
- `user_typing({ roomId, user })`
- `user_joined({ roomId, user })`
- `connection_status(status)`

## 📱 Plataformas Suportadas

### ✅ Implementado
- [x] **Backend API** - Completo
- [x] **Web App** - Completo
- [ ] **Mobile (React Native)** - Em desenvolvimento
- [ ] **Desktop (Electron)** - Em desenvolvimento  
- [ ] **Android Nativo** - Planejado

### 🎯 Funcionalidades Core
- [x] Autenticação JWT
- [x] Chat em tempo real
- [x] Criação de grupos
- [x] Estados de conexão
- [x] Indicadores de digitação
- [x] Design responsivo
- [ ] Persistência offline
- [ ] Notificações push
- [ ] Compartilhamento de arquivos

## 🧪 Testes

### Cobertura Atual
- **Backend**: 70%+ cobertura de testes
- **Web**: Testes de componentes principais
- **E2E**: Fluxos críticos

```bash
# Executar testes
npm run test:all

# Com cobertura
npm run test:backend -- --coverage

# Watch mode
npm run test:web -- --watch
```

## 🚀 Deploy

### Web
```bash
# Build para produção
npm run build:web

# Preview local
cd web && npm run preview
```

### Backend
```bash
# Build
npm run build:backend

# Produção
npm start
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🐛 Issues Conhecidos

- [ ] Reconexão do WebSocket em mobile pode falhar
- [ ] Performance em salas com 1000+ mensagens
- [ ] Notificações push precisam de configuração manual

## 🔗 Links Úteis

- [Documentação da API](./backend/README.md)
- [Guia de Componentes](./web/README.md)
- [Setup Mobile](./mobile/README.md)
- [Issues](https://github.com/seu-usuario/p2p-chat/issues)

---

**Desenvolvido com ❤️ para comunicação em tempo real**# Chat
