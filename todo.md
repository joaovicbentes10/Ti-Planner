# IT Task Planner - TODO

## Setup e Configuração
- [x] Gerar logo do aplicativo
- [x] Configurar tema de cores (Indigo/Tech)
- [x] Atualizar app.config.ts com nome e branding

## Estrutura de Navegação
- [x] Configurar tabs (Home, Tasks, Kanban, Timer, More)
- [x] Mapear ícones no icon-symbol.tsx
- [x] Criar telas base para cada tab

## Sistema de Dados
- [x] Criar tipos TypeScript (Task, Project, Subtask, etc)
- [x] Implementar store com AsyncStorage
- [x] Criar hooks para gerenciamento de estado

## Tela Home (Dashboard)
- [x] Header com saudação e data
- [x] Cards de resumo (Hoje, Em Progresso, Concluídas)
- [x] Lista de tarefas urgentes
- [x] Barra de progresso semanal
- [x] Botão de acesso rápido

## Tela de Tarefas
- [x] Barra de busca
- [x] Filtros por status, prioridade, projeto
- [x] Lista de tarefas com TaskCard
- [x] FAB para adicionar tarefa
- [x] Swipe actions (editar/excluir)

## Modal de Tarefa
- [x] Formulário completo de tarefa
- [x] Seletor de projeto
- [x] Seletor de prioridade
- [x] Seletor de status
- [x] Date picker para data de vencimento
- [x] Campo de estimativa de tempo
- [x] Tags selecionáveis
- [x] Lista de subtarefas
- [x] Campo de notas técnicas

## Tela de Projetos
- [x] Lista de projetos
- [x] Criar novo projeto
- [x] Editar projeto
- [x] Excluir projeto
- [x] Ver tarefas do projeto

## Tela Kanban
- [x] Colunas de status
- [x] Cards de tarefas
- [x] Mover tarefas entre colunas
- [x] Filtro por projeto

## Tela Calendário
- [x] Grade mensal
- [x] Navegação entre meses
- [x] Indicadores de tarefas por dia
- [x] Lista de tarefas do dia selecionado

## Tela Timer Pomodoro
- [x] Timer circular animado
- [x] Controles (play, pause, reset)
- [x] Contador de sessões
- [x] Configuração de durações
- [x] Vinculação com tarefa
- [x] Notificação sonora/vibração

## Tela de Estatísticas
- [x] Cards de métricas
- [x] Distribuição por status/prioridade
- [x] Total de tempo focado
- [x] Progresso por projeto

## Tela de Configurações
- [x] Seletor de tema
- [x] Configurações do Pomodoro
- [x] Toggle de notificações
- [x] Exportar dados
- [x] Informações do app

## Componentes
- [x] TaskCard
- [x] PriorityBadge
- [x] StatusChip
- [x] TagChip
- [x] ProjectBadge
- [x] StatCard
- [x] EmptyState

## Melhorias e Polish
- [x] Haptic feedback
- [x] Estados de loading
- [x] Estados vazios
- [x] Tratamento de erros


## Melhorias Solicitadas (v2.1)
- [x] Quick actions para mudar status de tarefa sem editar
- [x] Seletor de cores corporativas para projetos
- [x] Modais de confirmação customizados (não padrão do Android)
- [x] Reposicionar timer Pomodoro (acima das abas)
- [x] Corrigir proporções do calendário
- [x] Testes visuais completos e correção de bugs

## Novas Funcionalidades Propostas
- [x] Tarefas recorrentes (diárias, semanais, mensais)
- [x] Relatórios semanais/mensais de produtividade
- [ ] Gráficos de produtividade no dashboard
- [ ] Filtros salvos para busca rápida
- [ ] Modo offline com sincronização automática
- [ ] Atalhos de teclado para produtividade
- [ ] Integração com calendário do sistema
- [ ] Histórico de alterações de tarefas


## Bugs Reportados (v2.1 - Correção)
- [x] Data de vencimento não abre calendário ao clicar
- [x] Timer Pomodoro bugado - entra em outras opções
- [x] Melhorar tela inicial (onboarding)
- [x] Revisar funcionalidades que não estão funcionando
- [ ] Quick actions para status não está integrado
- [ ] Cores corporativas podem não estar salvando corretamente
- [ ] Modais customizados precisam de validação


## Novas Funcionalidades (v2.3)
- [x] Quick Status Actions com swipe/long-press
- [x] Validar persistência de cores de projetos
- [x] Notificações locais para tarefas vencidas
- [x] Testes completos das novas funcionalidades


## Bugs Críticos a Corrigir (v2.4)
- [x] Projeto obrigatório na criação de tarefa
- [x] Teclado bloqueando botão salvar em add-task
- [x] Seletor de cores bugado com teclado aberto
- [x] Revisar e corrigir bugs visuais em geral


## Correções v2.5
- [x] Corrigir layout da tela de novo projeto - botão salvar acessível
- [x] Adicionar animação de abertura/splash screen
- [x] Melhorar layout de tarefas com design corporativo
- [x] Revisar e corrigir bugs identificados pelo usuário


## Bugs Críticos v2.6
- [x] Remover ícone padrão do Expo que aparece antes do splash customizado
- [x] Ordenar tarefas do projeto: não concluídas no topo, concluídas embaixo
- [x] Timer bugado - relógio mesclado com as opções de modo
- [x] Modal de novo projeto - botões salvar/cancelar inacessíveis no topo
- [x] Adicionar sistema de comentários em tarefas
- [x] Edição rápida de prioridade e status na tela de detalhes


## Bug de Migração v2.6.1
- [x] Adicionar campo comments às tarefas existentes (migração de dados)


## Correção de Splash Screen (v2.6.2)
- [x] Corrigir ocultamento do splash screen padrão do Expo
- [x] Garantir que apenas a splash screen customizada seja exibida
- [x] Testar inicialização do aplicativo


## Mudanças Solicitadas pelo Usuário (v2.6.3)
- [x] Remover aba Timer do aplicativo
- [x] Renomear app para "TI Planner"
- [x] Corrigir layout de seleção de cores do projeto (cortado)
