import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { TaskCard } from '@/components/task-card';
import { EmptyState } from '@/components/empty-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTaskContext } from '@/lib/task-context';
import { Task, STATUS_CONFIG } from '@/lib/types';

export default function ProjectDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { projects, tasks, toggleTask } = useTaskContext();

  const project = projects.find(p => p.id === id);
  const projectTasks = useMemo(() => {
    const filtered = tasks.filter(t => t.projectId === id);
    // Sort: incomplete tasks first, then completed
    return filtered.sort((a, b) => {
      const aCompleted = a.status === 'done' ? 1 : 0;
      const bCompleted = b.status === 'done' ? 1 : 0;
      return aCompleted - bCompleted;
    });
  }, [tasks, id]);

  const stats = useMemo(() => {
    const total = projectTasks.length;
    const completed = projectTasks.filter(t => t.status === 'done').length;
    const inProgress = projectTasks.filter(t => t.status === 'in_progress').length;
    const todo = projectTasks.filter(t => t.status === 'todo').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, todo, progress };
  }, [projectTasks]);

  if (!project) {
    return (
      <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.muted }]}>Projeto não encontrado</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backLink, { color: colors.primary }]}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const renderTask = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={() => router.push(`/task/${item.id}` as any)}
      onToggle={() => toggleTask(item.id)}
    />
  );

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.projectDot, { backgroundColor: project.color }]} />
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {project.name}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/add-task' as any)}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Project Stats */}
      <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: STATUS_CONFIG.todo.color }]}>{stats.todo}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>A Fazer</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: STATUS_CONFIG.in_progress.color }]}>{stats.inProgress}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Em Progresso</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: STATUS_CONFIG.done.color }]}>{stats.completed}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Concluídas</Text>
          </View>
        </View>
        
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.muted }]}>Progresso</Text>
            <Text style={[styles.progressValue, { color: colors.foreground }]}>{stats.progress}%</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { backgroundColor: project.color, width: `${stats.progress}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Description */}
      {project.description && (
        <View style={styles.descriptionContainer}>
          <Text style={[styles.description, { color: colors.muted }]}>{project.description}</Text>
        </View>
      )}

      {/* Tasks List */}
      <View style={styles.tasksHeader}>
        <Text style={[styles.tasksTitle, { color: colors.foreground }]}>Tarefas</Text>
      </View>

      <FlatList
        data={projectTasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="checklist"
            title="Nenhuma tarefa neste projeto"
            description="Adicione tarefas para começar a organizar seu trabalho"
            actionLabel="Nova Tarefa"
            onAction={() => router.push('/add-task' as any)}
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
  },
  projectDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    marginBottom: 12,
  },
  backLink: {
    fontSize: 16,
    fontWeight: '500',
  },
  statsCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  tasksHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
});
