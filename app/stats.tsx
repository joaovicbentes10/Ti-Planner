import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTaskContext } from '@/lib/task-context';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/types';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function StatsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { tasks, projects, pomodoroSessions, dailyStats } = useTaskContext();

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const todoTasks = tasks.filter(t => t.status === 'todo').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
    const reviewTasks = tasks.filter(t => t.status === 'review').length;

    const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
    const mediumPriority = tasks.filter(t => t.priority === 'medium' && t.status !== 'done').length;
    const lowPriority = tasks.filter(t => t.priority === 'low' && t.status !== 'done').length;

    // Pomodoro stats
    const workSessions = pomodoroSessions.filter(s => s.type === 'work');
    const totalPomodoros = workSessions.length;
    const totalFocusMinutes = workSessions.reduce((acc, s) => acc + s.duration, 0);
    const totalFocusHours = Math.round(totalFocusMinutes / 60 * 10) / 10;

    // Weekly stats (last 7 days)
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyCompleted = tasks.filter(t => {
      if (!t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      return completedDate >= weekAgo && completedDate <= today;
    }).length;

    const weeklyPomodoros = workSessions.filter(s => {
      const sessionDate = new Date(s.completedAt);
      return sessionDate >= weekAgo && sessionDate <= today;
    }).length;

    // Completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Estimated vs actual time
    const tasksWithEstimate = tasks.filter(t => t.estimatedHours && t.status === 'done');
    const totalEstimatedHours = tasksWithEstimate.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
    const totalActualHours = tasksWithEstimate.reduce((acc, t) => acc + (t.actualHours || 0), 0);

    // Overdue tasks
    const overdueTasks = tasks.filter(t => {
      if (t.status === 'done' || !t.dueDate) return false;
      return new Date(t.dueDate) < today;
    }).length;

    // Average tasks per day (last 30 days)
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthlyCompleted = tasks.filter(t => {
      if (!t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      return completedDate >= monthAgo && completedDate <= today;
    }).length;
    const avgTasksPerDay = Math.round(monthlyCompleted / 30 * 10) / 10;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      blockedTasks,
      reviewTasks,
      highPriority,
      mediumPriority,
      lowPriority,
      totalPomodoros,
      totalFocusHours,
      weeklyCompleted,
      weeklyPomodoros,
      completionRate,
      totalEstimatedHours,
      totalActualHours,
      overdueTasks,
      avgTasksPerDay,
    };
  }, [tasks, pomodoroSessions]);

  // Project stats
  const projectStats = useMemo(() => {
    return projects.map(project => {
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const completed = projectTasks.filter(t => t.status === 'done').length;
      const total = projectTasks.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { ...project, completed, total, progress };
    }).sort((a, b) => b.total - a.total);
  }, [projects, tasks]);

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Estatísticas</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Overview Cards */}
        <View style={styles.overviewGrid}>
          <View style={[styles.overviewCard, { backgroundColor: colors.primary + '15' }]}>
            <IconSymbol name="checklist" size={24} color={colors.primary} />
            <Text style={[styles.overviewValue, { color: colors.foreground }]}>{stats.totalTasks}</Text>
            <Text style={[styles.overviewLabel, { color: colors.muted }]}>Total de Tarefas</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: colors.success + '15' }]}>
            <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
            <Text style={[styles.overviewValue, { color: colors.foreground }]}>{stats.completionRate}%</Text>
            <Text style={[styles.overviewLabel, { color: colors.muted }]}>Taxa de Conclusão</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: colors.warning + '15' }]}>
            <IconSymbol name="clock.fill" size={24} color={colors.warning} />
            <Text style={[styles.overviewValue, { color: colors.foreground }]}>{stats.totalFocusHours}h</Text>
            <Text style={[styles.overviewLabel, { color: colors.muted }]}>Tempo de Foco</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: colors.error + '15' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={24} color={colors.error} />
            <Text style={[styles.overviewValue, { color: colors.foreground }]}>{stats.overdueTasks}</Text>
            <Text style={[styles.overviewLabel, { color: colors.muted }]}>Atrasadas</Text>
          </View>
        </View>

        {/* Weekly Summary */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Esta Semana</Text>
          <View style={styles.weeklyStats}>
            <View style={styles.weeklyStat}>
              <Text style={[styles.weeklyValue, { color: colors.success }]}>{stats.weeklyCompleted}</Text>
              <Text style={[styles.weeklyLabel, { color: colors.muted }]}>Tarefas Concluídas</Text>
            </View>
            <View style={[styles.weeklyDivider, { backgroundColor: colors.border }]} />
            <View style={styles.weeklyStat}>
              <Text style={[styles.weeklyValue, { color: colors.primary }]}>{stats.weeklyPomodoros}</Text>
              <Text style={[styles.weeklyLabel, { color: colors.muted }]}>Sessões Pomodoro</Text>
            </View>
            <View style={[styles.weeklyDivider, { backgroundColor: colors.border }]} />
            <View style={styles.weeklyStat}>
              <Text style={[styles.weeklyValue, { color: colors.warning }]}>{stats.avgTasksPerDay}</Text>
              <Text style={[styles.weeklyLabel, { color: colors.muted }]}>Média/Dia</Text>
            </View>
          </View>
        </View>

        {/* Status Distribution */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Distribuição por Status</Text>
          <View style={styles.statusBars}>
            {[
              { label: 'A Fazer', value: stats.todoTasks, color: STATUS_CONFIG.todo.color },
              { label: 'Em Progresso', value: stats.inProgressTasks, color: STATUS_CONFIG.in_progress.color },
              { label: 'Revisão', value: stats.reviewTasks, color: STATUS_CONFIG.review.color },
              { label: 'Concluídas', value: stats.completedTasks, color: STATUS_CONFIG.done.color },
              { label: 'Bloqueadas', value: stats.blockedTasks, color: STATUS_CONFIG.blocked.color },
            ].map((item, index) => (
              <View key={index} style={styles.statusBar}>
                <View style={styles.statusBarHeader}>
                  <View style={[styles.statusDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.statusLabel, { color: colors.foreground }]}>{item.label}</Text>
                  <Text style={[styles.statusValue, { color: colors.muted }]}>{item.value}</Text>
                </View>
                <View style={[styles.statusBarTrack, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.statusBarFill, 
                      { 
                        backgroundColor: item.color,
                        width: stats.totalTasks > 0 ? `${(item.value / stats.totalTasks) * 100}%` : '0%'
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Priority Distribution */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tarefas Pendentes por Prioridade</Text>
          <View style={styles.priorityGrid}>
            <View style={[styles.priorityCard, { backgroundColor: PRIORITY_CONFIG.high.color + '15' }]}>
              <Text style={[styles.priorityValue, { color: PRIORITY_CONFIG.high.color }]}>{stats.highPriority}</Text>
              <Text style={[styles.priorityLabel, { color: colors.muted }]}>Alta</Text>
            </View>
            <View style={[styles.priorityCard, { backgroundColor: PRIORITY_CONFIG.medium.color + '15' }]}>
              <Text style={[styles.priorityValue, { color: PRIORITY_CONFIG.medium.color }]}>{stats.mediumPriority}</Text>
              <Text style={[styles.priorityLabel, { color: colors.muted }]}>Média</Text>
            </View>
            <View style={[styles.priorityCard, { backgroundColor: PRIORITY_CONFIG.low.color + '15' }]}>
              <Text style={[styles.priorityValue, { color: PRIORITY_CONFIG.low.color }]}>{stats.lowPriority}</Text>
              <Text style={[styles.priorityLabel, { color: colors.muted }]}>Baixa</Text>
            </View>
          </View>
        </View>

        {/* Projects Progress */}
        {projectStats.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Progresso por Projeto</Text>
            {projectStats.slice(0, 5).map(project => (
              <View key={project.id} style={styles.projectRow}>
                <View style={styles.projectInfo}>
                  <View style={[styles.projectDot, { backgroundColor: project.color }]} />
                  <Text style={[styles.projectName, { color: colors.foreground }]} numberOfLines={1}>
                    {project.name}
                  </Text>
                </View>
                <View style={styles.projectProgress}>
                  <View style={[styles.projectProgressTrack, { backgroundColor: colors.border }]}>
                    <View 
                      style={[
                        styles.projectProgressFill, 
                        { backgroundColor: project.color, width: `${project.progress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.projectProgressText, { color: colors.muted }]}>
                    {project.completed}/{project.total}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Pomodoro Stats */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pomodoro</Text>
          <View style={styles.pomodoroStats}>
            <View style={styles.pomodoroStat}>
              <IconSymbol name="flame.fill" size={28} color={colors.warning} />
              <Text style={[styles.pomodoroValue, { color: colors.foreground }]}>{stats.totalPomodoros}</Text>
              <Text style={[styles.pomodoroLabel, { color: colors.muted }]}>Sessões Totais</Text>
            </View>
            <View style={styles.pomodoroStat}>
              <IconSymbol name="clock.fill" size={28} color={colors.primary} />
              <Text style={[styles.pomodoroValue, { color: colors.foreground }]}>{stats.totalFocusHours}h</Text>
              <Text style={[styles.pomodoroLabel, { color: colors.muted }]}>Tempo de Foco</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  overviewCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    margin: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  weeklyStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyStat: {
    flex: 1,
    alignItems: 'center',
  },
  weeklyValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  weeklyLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  weeklyDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 8,
  },
  statusBars: {
    gap: 12,
  },
  statusBar: {
    gap: 6,
  },
  statusBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusLabel: {
    flex: 1,
    fontSize: 13,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  statusBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityCard: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  priorityValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  priorityLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  projectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  projectName: {
    flex: 1,
    fontSize: 14,
  },
  projectProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectProgressTrack: {
    width: 80,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  projectProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  projectProgressText: {
    fontSize: 12,
    width: 40,
    textAlign: 'right',
  },
  pomodoroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  pomodoroStat: {
    alignItems: 'center',
  },
  pomodoroValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  pomodoroLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
