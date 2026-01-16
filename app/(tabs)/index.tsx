import React, { useMemo } from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { StatCard } from '@/components/stat-card';
import { TaskCard } from '@/components/task-card';
import { EmptyState } from '@/components/empty-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTaskContext } from '@/lib/task-context';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { 
    tasks, 
    projects, 
    refreshData, 
    toggleTask,
    getTodayTasks,
    getOverdueTasks,
  } = useTaskContext();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = getTodayTasks();
    const overdueTasks = getOverdueTasks();
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const completedToday = tasks.filter(t => 
      t.completedAt && t.completedAt.split('T')[0] === today
    );
    
    // Weekly progress
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekTasks = tasks.filter(t => new Date(t.createdAt) >= weekStart);
    const weekCompleted = weekTasks.filter(t => t.status === 'done').length;
    const weekProgress = weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;

    return {
      todayCount: todayTasks.length,
      overdueCount: overdueTasks.length,
      inProgressCount: inProgressTasks.length,
      completedTodayCount: completedToday.length,
      weekProgress,
    };
  }, [tasks, getTodayTasks, getOverdueTasks]);

  // Get urgent tasks (overdue + due today, sorted by priority)
  const urgentTasks = useMemo(() => {
    const overdue = getOverdueTasks();
    const today = getTodayTasks().filter(t => t.status !== 'done');
    const combined = [...overdue, ...today];
    
    const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
    return combined
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 5);
  }, [getTodayTasks, getOverdueTasks]);

  const getProject = (projectId?: string) => {
    if (!projectId) return undefined;
    return projects.find(p => p.id === projectId);
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const hasNoTasks = tasks.length === 0;

  return (
    <ScreenContainer>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.foreground }]}>{greeting}!</Text>
            <Text style={[styles.date, { color: colors.muted }]}>{todayFormatted}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/add-task')}
            activeOpacity={0.8}
          >
            <IconSymbol name="plus" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Onboarding - Show if no tasks */}
        {hasNoTasks && (
          <View style={[styles.onboardingCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
            <View style={styles.onboardingContent}>
              <IconSymbol name="sparkles" size={32} color={colors.primary} />
              <Text style={[styles.onboardingTitle, { color: colors.foreground }]}>Bem-vindo!</Text>
              <Text style={[styles.onboardingText, { color: colors.muted }]}>
                Comece criando sua primeira tarefa. Organize seu trabalho em projetos, defina prioridades e acompanhe seu progresso.
              </Text>
              <TouchableOpacity 
                style={[styles.onboardingButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/add-task')}
              >
                <Text style={styles.onboardingButtonText}>Criar Primeira Tarefa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Stats Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        >
          <StatCard
            title="Para Hoje"
            value={stats.todayCount}
            icon="calendar"
            iconColor={colors.primary}
            subtitle={stats.overdueCount > 0 ? `${stats.overdueCount} atrasada(s)` : undefined}
          />
          <StatCard
            title="Em Progresso"
            value={stats.inProgressCount}
            icon="checklist"
            iconColor={colors.info}
          />
          <StatCard
            title="Concluídas Hoje"
            value={stats.completedTodayCount}
            icon="checkmark.circle.fill"
            iconColor={colors.success}
          />
          <StatCard
            title="Progresso Semanal"
            value={`${stats.weekProgress}%`}
            icon="chart.bar.fill"
            iconColor={colors.warning}
          />
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Acesso Rápido</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push('/add-task')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '15' }]}>
                <IconSymbol name="plus.circle.fill" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.foreground }]}>Nova Tarefa</Text>
            </TouchableOpacity>
            
            
            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push('/(tabs)/kanban')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.warning + '15' }]}>
                <IconSymbol name="square.grid.2x2" size={20} color={colors.warning} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.foreground }]}>Kanban</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Urgent Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tarefas Urgentes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          
          {urgentTasks.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="checkmark.circle.fill" size={32} color={colors.success} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                Nenhuma tarefa urgente. Ótimo trabalho!
              </Text>
            </View>
          ) : (
            urgentTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                project={getProject(task.projectId)}
                onPress={() => router.push(`/task/${task.id}`)}
                onToggle={() => toggleTask(task.id)}
                compact
              />
            ))
          )}
        </View>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Projetos</Text>
              <TouchableOpacity onPress={() => router.push('/projects')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.projectsContainer}
            >
              {projects.slice(0, 5).map(project => {
                const projectTasks = tasks.filter(t => t.projectId === project.id);
                const completedCount = projectTasks.filter(t => t.status === 'done').length;
                
                return (
                  <TouchableOpacity
                    key={project.id}
                    style={[styles.projectCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => router.push(`/project/${project.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.projectColor, { backgroundColor: project.color }]} />
                    <Text style={[styles.projectName, { color: colors.foreground }]} numberOfLines={1}>
                      {project.name}
                    </Text>
                    <Text style={[styles.projectCount, { color: colors.muted }]}>
                      {completedCount}/{projectTasks.length} tarefas
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
  },
  date: {
    fontSize: 14,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    gap: 12,
    paddingBottom: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  projectsContainer: {
    gap: 12,
  },
  projectCard: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  projectColor: {
    width: 32,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectCount: {
    fontSize: 12,
  },
  onboardingCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  onboardingContent: {
    alignItems: 'center',
    gap: 12,
  },
  onboardingTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  onboardingText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  onboardingButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 8,
  },
  onboardingButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
