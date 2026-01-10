# Bug Fixes - IT Task Planner v2.4

## Bugs Corrigidos

### 1. Projeto Obrigatório na Criação de Tarefa
- **Problema**: Ao salvar tarefa sem projeto, a tela fechava e perdia-se o conteúdo
- **Solução**: 
  - Adicionada validação para verificar se `projectId` está preenchido
  - Mostrado alert ao usuário pedindo para selecionar um projeto
  - Label do projeto agora mostra asterisco (*) indicando campo obrigatório
  - Tarefa não é salva se projeto não estiver selecionado

### 2. Teclado Bloqueando Botão Salvar
- **Problema**: Quando teclado estava aberto, o botão salvar ficava inacessível
- **Solução**:
  - Alterado `KeyboardAvoidingView` para usar `behavior="height"` no Android
  - Adicionado `keyboardVerticalOffset` para melhor espaçamento
  - Removido `edges={['bottom']}` do `ScreenContainer` para permitir scroll
  - Adicionado `paddingBottom: 60` no scroll content para garantir espaço após teclado
  - Agora o usuário consegue fazer scroll e acessar o botão salvar

### 3. Layout Responsivo
- **Problema**: Elementos desproporcionais em diferentes tamanhos de tela
- **Solução**:
  - Melhorado espaçamento vertical
  - Ajustado padding e margin para melhor proporção
  - Header agora com `zIndex: 100` para ficar acima do conteúdo

## Testes Realizados
- ✓ Validação de projeto obrigatório
- ✓ Teclado não bloqueia mais o botão salvar
- ✓ Scroll funciona corretamente com teclado aberto
- ✓ Layout responsivo em diferentes tamanhos

## Próximas Melhorias
- Adicionar feedback visual melhor para campos obrigatórios
- Implementar validação em tempo real
- Melhorar UX de seletor de cores
