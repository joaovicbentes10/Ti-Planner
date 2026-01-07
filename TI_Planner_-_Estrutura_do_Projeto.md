# TI Planner - Estrutura do Projeto

## 📱 Visão Geral
TI Planner é um aplicativo de gerenciamento de tarefas desenvolvido com React Native e Expo, especificamente projetado para profissionais de TI.

## 🏗️ Estrutura de Pastas

```
ti-task-planner/
├── app/                          # Telas e rotas (Expo Router)
│   ├── (tabs)/                   # Abas principais
│   │   ├── _layout.tsx          # Configuração das abas
│   │   ├── index.tsx            # Dashboard/Início
│   │   ├── tasks.tsx            # Lista de tarefas
│   │   ├── kanban.tsx           # Visualização Kanban
│   │   └── more.tsx             # Menu Mais (Projetos, Estatísticas, Configurações)
│   ├── _layout.tsx              # Layout raiz com provedores
│   ├── add-task.tsx             # Tela de criação de tarefa
│   ├── task/[id].tsx            # Detalhes da tarefa
│   ├── projects.tsx             # Gerenciamento de projetos
│   ├── project/[id].tsx         # Tarefas de um projeto
│   ├── calendar.tsx             # Visualização por calendário
│   ├── stats.tsx                # Estatísticas e relatórios
│   ├── settings.tsx             # Configurações do app
│   ├── export.tsx               # Exportar dados
│   └── weekly-report.tsx        # Relatório semanal
│
├── components/                   # Componentes reutilizáveis
│   ├── task-card.tsx            # Card de tarefa
│   ├── stat-card.tsx            # Card de estatística
│   ├── empty-state.tsx          # Estado vazio
│   ├── color-picker.tsx         # Seletor de cores
│   ├── task-comments.tsx        # Sistema de comentários
│   ├── confirmation-modal.tsx   # Modal de confirmação
│   ├── quick-status-menu.tsx    # Menu de status rápido
│   ├── swipe-task-actions.tsx   # Ações de swipe
│   ├── splash-screen.tsx        # Tela de carregamento
│   ├── screen-container.tsx     # Container com SafeArea
│   ├── haptic-tab.tsx           # Tab com feedback háptico
│   └── ui/                       # Componentes de UI
│       └── icon-symbol.tsx      # Mapeamento de ícones
│
├── lib/                          # Lógica e utilitários
│   ├── task-context.tsx         # Context API para estado global
│   ├── types.ts                 # Tipos TypeScript
│   ├── store.ts                 # Persistência com AsyncStorage
│   ├── recurring.ts             # Lógica de tarefas recorrentes
│   ├── notifications.ts         # Notificações locais
│   ├── migrations.ts            # Migrações de dados
│   ├── theme-provider.tsx       # Provedor de tema
│   ├── trpc.ts                  # Cliente tRPC
│   ├── utils.ts                 # Funções utilitárias
│   └── _core/                   # Núcleo do app
│       ├── theme.ts             # Configuração de cores
│       ├── manus-runtime.ts     # Runtime do Manus
│       └── nativewind-pressable.ts
│
├── hooks/                        # Custom hooks
│   ├── use-colors.ts            # Hook de cores
│   ├── use-color-scheme.ts      # Hook de tema
│   └── use-auth.ts              # Hook de autenticação
│
├── constants/                    # Constantes
│   ├── theme.ts                 # Paleta de cores
│   ├── const.ts                 # Constantes gerais
│   └── oauth.ts                 # Configurações OAuth
│
├── assets/                       # Imagens e ícones
│   └── images/
│       ├── icon.png             # Ícone do app
│       ├── splash-icon.png      # Ícone da splash
│       └── favicon.png          # Favicon
│
├── server/                       # Backend (opcional)
│   ├── _core/                   # Núcleo do servidor
│   ├── routers.ts               # Rotas tRPC
│   └── db.ts                    # Configuração do banco
│
├── app.config.ts                # Configuração do Expo
├── app.json                     # Metadados do app
├── package.json                 # Dependências
├── tsconfig.json                # Configuração TypeScript
├── tailwind.config.js           # Configuração Tailwind
├── theme.config.js              # Paleta de cores
└── README.md                    # Documentação
```

## 🎯 Principais Funcionalidades

### Dashboard (Início)
- Resumo do dia com tarefas para hoje
- Cards de estatísticas (tarefas em progresso, concluídas)
- Acesso rápido para criar tarefas
- Progresso semanal

### Gerenciamento de Tarefas
- Criar, editar e excluir tarefas
- Prioridades (Baixa, Média, Alta, Crítica)
- Status (A Fazer, Em Progresso, Concluído)
- Tags técnicas (Bug, Feature, Deploy, Docs)
- Subtarefas
- Estimativa de tempo
- Data de vencimento
- Comentários em tarefas
- Edição rápida de status e prioridade

### Visualizações
- **Lista**: Visualização padrão com filtros
- **Kanban**: Colunas por status
- **Calendário**: Visualização por data
- **Estatísticas**: Gráficos e métricas

### Projetos
- Criar e gerenciar projetos
- Cores corporativas personalizáveis
- Visualizar tarefas por projeto
- Estatísticas por projeto

### Configurações
- Tema claro/escuro
- Notificações locais
- Exportar dados em JSON

### Relatórios
- Relatório semanal com gráficos
- Estatísticas de produtividade
- Tempo total de foco

## 🛠️ Stack Tecnológico

- **React Native** 0.81
- **Expo** SDK 54
- **TypeScript** 5.9
- **Expo Router** 6 (navegação)
- **NativeWind** 4 (Tailwind CSS)
- **AsyncStorage** (persistência local)
- **Context API** (gerenciamento de estado)
- **Jest/Vitest** (testes)

## 📦 Principais Dependências

```json
{
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo": "~54.0.29",
  "expo-router": "~6.0.19",
  "nativewind": "^4.2.1",
  "@react-native-async-storage/async-storage": "^2.2.0",
  "expo-notifications": "~0.32.15",
  "expo-haptics": "~15.0.8",
  "react-native-reanimated": "~4.1.6",
  "react-native-gesture-handler": "~2.28.0",
  "@tanstack/react-query": "^5.90.12",
  "@trpc/client": "11.7.2"
}
```

## 🚀 Como Executar

1. **Instalar dependências**
   ```bash
   pnpm install
   ```

2. **Iniciar o servidor de desenvolvimento**
   ```bash
   pnpm dev
   ```

3. **Executar testes**
   ```bash
   pnpm test
   ```

4. **Build para produção**
   ```bash
   pnpm build
   ```

## 📱 Plataformas Suportadas

- iOS (via Expo Go ou build nativo)
- Android (via Expo Go ou build nativo)
- Web (preview)

## 🎨 Sistema de Cores

### Cores Corporativas para Projetos
- Azul Profissional (#0066CC)
- Cinza Neutro (#4A5568)
- Verde Sucesso (#059669)
- Laranja Atenção (#D97706)
- Vermelho Crítico (#DC2626)
- Roxo Inovação (#7C3AED)
- Azul Ciano (#0891B2)
- Índigo (#4F46E5)

### Tema do App
- **Claro**: Fundo branco, texto escuro
- **Escuro**: Fundo escuro, texto claro
- **Sistema**: Segue preferência do dispositivo

## 📊 Tipos Principais

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId: string;
  dueDate?: number;
  estimatedTime?: number;
  tags: string[];
  subtasks: Subtask[];
  comments: Comment[];
  recurring?: RecurringConfig;
  createdAt: number;
  updatedAt: number;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: number;
}

interface Comment {
  id: string;
  text: string;
  createdAt: number;
}
```

## 🧪 Testes

O projeto inclui 20 testes automatizados cobrindo:
- Componentes principais
- Persistência de dados
- Tipos TypeScript
- Migrações de dados

Execute com: `pnpm test`

## 🔄 Migração de Dados

O app inclui um sistema automático de migração para compatibilidade entre versões. Novas migrações são adicionadas em `lib/migrations.ts`.

## 📝 Notas Importantes

1. **Projeto Obrigatório**: Todas as tarefas devem estar vinculadas a um projeto
2. **Persistência Local**: Todos os dados são armazenados localmente com AsyncStorage
3. **Notificações**: Requer permissão do usuário (solicitada automaticamente)
4. **Tema**: Muda automaticamente com preferência do sistema
5. **Responsividade**: Otimizado para portrait mode em dispositivos móveis

## 🐛 Bugs Conhecidos / Melhorias Futuras

- [ ] Integração com Git (vincular tarefas a commits)
- [ ] Backup com Google Drive/iCloud
- [ ] Templates de tarefas reutilizáveis
- [ ] Integração com Jira/Trello
- [ ] Modo offline robusto
- [ ] Exportação de relatórios em PDF
- [ ] Widgets para tela inicial

## 📄 Licença

Propriedade do usuário - Uso pessoal e profissional

---

**Versão**: 2.6.3
**Última atualização**: Janeiro 2026
