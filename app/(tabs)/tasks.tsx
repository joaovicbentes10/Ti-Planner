import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { TaskCard } from '@/components/task-card';
import { EmptyState } from '@/components/empty-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTaskContext } from '@/lib/task-context';
import { Task, TaskStatus, Priority, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/types';

type FilterType = 'all' | TaskStatus | Priority;

export default function TasksScreen() {
  const colors = useColors();
  const router = useRouter();
  const { tasks, projects, toggleTask, isLoading } = useTaskContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filters: { key: FilterType; label: string; color?: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'todo', label: 'A Fazer', color: STATUS_CONFIG.todo.color },
    { key: 'in_progress', label: 'Em Progresso', color: STATUS_CONFIG.in_progress.color },
    { key: 'review', label: 'Revisão', color: STATUS_CONFIG.review.color },
    { key: 'done', label: 'Concluídas', color: STATUS_CONFIG.done.color },
    { key: 'blocked', label: 'Bloqueadas', color: STATUS_CONFIG.blocked.color },
    { key: 'high', label: 'Alta Prioridade', color: PRIORITY_CONFIG.high.color },
  ];

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply status/priority filter
    if (activeFilter !== 'all') {
      if (['todo', 'in_progress', 'review', 'done', 'blocked'].includes(activeFilter)) {
        result = result.filter(task => task.status === activeFilter);
      } else if (['high', 'medium', 'low', 'none'].includes(activeFilter)) {
        result = result.filter(task => task.priority === activeFilter);
      }
    }

    // Sort by priority and date
    const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
    return result.sort((a, b) => {
      // Completed tasks go to bottom
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      
      // Then by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      // Finally by creation date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, searchQuery, activeFilter]);

  const getProject = (projectId?: string) => {
    if (!projectId) return undefined;
    return projects.find(p => p.id === projectId);
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      project={getProject(item.projectId)}
      onPress={() => router.push(`/task/${item.id}` as any)}
      onToggle={() => toggleTask(item.id)}
    />
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Tarefas</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/add-task' as any)}
          activeOpacity={0.8}
        >
          <IconSymbol name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Buscar tarefas..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.filterButton, showFilters && { backgroundColor: colors.primary + '15' }]}
        >
          <IconSymbol 
            name="line.3.horizontal.decrease" 
            size={18} 
            color={showFilters ? colors.primary : colors.muted} 
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filters}
            keyExtractor={item => item.key}
            contentContainerStyle={styles.filtersList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  { 
                    backgroundColor: activeFilter === item.key ? colors.primary : colors.surface,
                    borderColor: activeFilter === item.key ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setActiveFilter(item.key)}
                activeOpacity={0.7}
              >
                {item.color && (
                  <View style={[styles.filterDot, { backgroundColor: item.color }]} />
                )}
                <Text style={[
                  styles.filterText,
                  { color: activeFilter === item.key ? '#fff' : colors.foreground }
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Task Count */}
      <View style={styles.countContainer}>
        <Text style={[styles.countText, { color: colors.muted }]}>
          {filteredTasks.length} {filteredTasks.length === 1 ? 'tarefa' : 'tarefas'}
          {activeFilter !== 'all' && ` • Filtro: ${filters.find(f => f.key === activeFilter)?.label}`}
        </Text>
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="checklist"
            title={searchQuery ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa ainda"}
            description={searchQuery 
              ? "Tente buscar por outro termo" 
              : "Crie sua primeira tarefa para começar a organizar seu trabalho"
            }
            actionLabel={searchQuery ? undefined : "Nova Tarefa"}
            onAction={searchQuery ? undefined : () => router.push('/add-task' as any)}
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filterButton: {
    padding: 4,
    borderRadius: 6,
  },
  filtersContainer: {
    marginTop: 12,
  },
  filtersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    marginRight: 8,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
});
