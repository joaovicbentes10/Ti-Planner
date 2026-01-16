# IT Task Planner - Design Document

## Visão Geral

O IT Task Planner é um aplicativo de gerenciamento de tarefas avançado projetado especificamente para profissionais de TI. O app permite criar, organizar e acompanhar tarefas de desenvolvimento, manutenção de sistemas, bugs, features e projetos de forma eficiente.

## Paleta de Cores

O design utiliza uma paleta profissional e moderna que transmite produtividade e tecnologia:

| Token | Light Mode | Dark Mode | Uso |
|-------|------------|-----------|-----|
| primary | #6366F1 (Indigo) | #818CF8 | Ações principais, destaques |
| background | #FAFBFC | #0D1117 | Fundo das telas |
| surface | #FFFFFF | #161B22 | Cards, modais |
| foreground | #1F2937 | #E6EDF3 | Texto principal |
| muted | #6B7280 | #8B949E | Texto secundário |
| border | #E5E7EB | #30363D | Bordas, divisores |
| success | #10B981 | #3FB950 | Status concluído |
| warning | #F59E0B | #D29922 | Prioridade média, alertas |
| error | #EF4444 | #F85149 | Prioridade alta, erros |
| info | #3B82F6 | #58A6FF | Informações, links |

## Lista de Telas

### 1. Home (Dashboard)
Tela principal com visão geral das tarefas do dia, estatísticas rápidas e acesso às principais funcionalidades.

### 2. Tarefas (Tasks)
Lista completa de tarefas com filtros por status, prioridade, projeto e tags. Permite busca e ordenação.

### 3. Projetos (Projects)
Gerenciamento de projetos/workspaces para organizar tarefas relacionadas.

### 4. Kanban
Visualização em quadro Kanban com colunas de status (To Do, In Progress, Review, Done).

### 5. Calendário (Calendar)
Visualização de tarefas por data com suporte a visualização mensal e semanal.

### 6. Estatísticas (Stats)
Métricas de produtividade, tarefas concluídas, tempo gasto, gráficos de progresso.

### 7. Configurações (Settings)
Preferências do app, temas, notificações, backup de dados.

## Conteúdo e Funcionalidades por Tela

### Home (Dashboard)
- **Header**: Saudação com nome do usuário, data atual
- **Resumo do Dia**: Cards com contadores (Tarefas Hoje, Em Progresso, Concluídas)
- **Tarefas Urgentes**: Lista das 5 tarefas mais urgentes/vencendo
- **Progresso Semanal**: Barra de progresso visual
- **Acesso Rápido**: Botões para criar tarefa e acesso ao Kanban

### Tarefas (Tasks)
- **Barra de Busca**: Pesquisa por título ou descrição
- **Filtros**: Chips para filtrar por status, prioridade, projeto, tag
- **Lista de Tarefas**: Cards com título, projeto, prioridade (cor), data, checkbox
- **FAB**: Botão flutuante para adicionar nova tarefa
- **Swipe Actions**: Deslizar para editar/excluir

### Modal de Tarefa (Add/Edit Task)
- **Título**: Campo obrigatório
- **Descrição**: Campo de texto multilinha com suporte a markdown
- **Projeto**: Seletor de projeto existente ou criar novo
- **Prioridade**: Alta (vermelho), Média (amarelo), Baixa (verde), Nenhuma (cinza)
- **Status**: To Do, In Progress, Review, Done, Blocked
- **Data de Vencimento**: Date picker
- **Estimativa**: Tempo estimado em horas
- **Tags**: Chips coloridos (Bug, Feature, Docs, Deploy, Meeting, Research)
- **Subtarefas**: Lista de checklist items
- **Notas Técnicas**: Campo para code snippets, comandos, links

### Projetos (Projects)
- **Lista de Projetos**: Cards com nome, cor, contagem de tarefas
- **Criar Projeto**: Nome, cor, descrição, ícone
- **Detalhes do Projeto**: Tarefas do projeto, progresso, estatísticas

### Kanban
- **Colunas**: To Do | In Progress | Review | Done
- **Cards**: Título, projeto badge, prioridade indicator, assignee avatar
- **Drag & Drop**: Arrastar cards entre colunas (gesture-based)
- **Filtro por Projeto**: Dropdown no header

### Calendário
- **Navegação**: Mês anterior/próximo, botão "Hoje"
- **Grade Mensal**: Dias com indicadores de tarefas (dots coloridos)
- **Lista do Dia**: Ao tocar em um dia, mostra tarefas daquela data
- **Adicionar**: Botão para criar tarefa na data selecionada

### Estatísticas
- **Período**: Seletor (Hoje, Semana, Mês, Ano)
- **Cards de Métricas**: Tarefas criadas, concluídas, taxa de conclusão
- **Gráfico de Barras**: Tarefas por dia da semana
- **Distribuição**: Pizza chart por status ou prioridade
- **Tempo Focado**: Total de horas produtivas

### Configurações
- **Aparência**: Tema (Claro, Escuro, Sistema)
- **Notificações**: Lembretes de tarefas
- **Dados**: Exportar/Importar JSON
- **Sobre**: Versão, créditos

## Fluxos de Usuário Principais

### Criar Nova Tarefa
1. Usuário toca no FAB (+) ou botão "Nova Tarefa"
2. Modal abre com formulário
3. Preenche título (obrigatório) e campos opcionais
4. Toca em "Salvar"
5. Tarefa aparece na lista/dashboard

### Completar Tarefa
1. Na lista de tarefas, toca no checkbox
2. Animação de check com haptic feedback
3. Tarefa move para status "Done"
4. Contador de concluídas atualiza

### Visualizar Kanban
1. Acessa aba Kanban
2. Vê todas tarefas organizadas por status
3. Arrasta card para nova coluna
4. Status da tarefa atualiza automaticamente

### Filtrar Tarefas
1. Na tela de Tarefas, toca em filtro
2. Seleciona critérios (projeto, prioridade, status)
3. Lista atualiza mostrando apenas matches
4. Pode combinar múltiplos filtros

## Estrutura de Dados

### Task
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  priority: 'high' | 'medium' | 'low' | 'none';
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  dueDate?: string; // ISO date
  estimatedHours?: number;
  tags: string[];
  subtasks: Subtask[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
}

```

## Navegação

O app utiliza navegação por tabs na parte inferior com 5 abas principais:

| Tab | Ícone | Tela |
|-----|-------|------|
| Home | house.fill | Dashboard |
| Tasks | checklist | Lista de Tarefas |
| Kanban | square.grid.2x2 | Quadro Kanban |
| More | ellipsis | Menu com Projetos, Calendário, Stats, Settings |

## Componentes Reutilizáveis

- **TaskCard**: Card de tarefa para listas
- **TaskModal**: Modal de criação/edição
- **PriorityBadge**: Indicador de prioridade colorido
- **StatusChip**: Chip de status
- **TagChip**: Tag colorida
- **ProjectBadge**: Badge com cor do projeto
- **StatCard**: Card de estatística
- **EmptyState**: Estado vazio com ilustração
