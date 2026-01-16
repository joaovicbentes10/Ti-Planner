import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTaskContext } from '@/lib/task-context';
import { PRIORITY_CONFIG, Priority } from '@/lib/types';

export default function WeeklyReportScreen() {
  const colors = useColors();
  const router = useRouter();
  const { tasks, dailyStats } = useTaskContext();

  const weekStats = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Get tasks completed this week
    const completedThisWeek = tasks.filter(t => {
      if (!t.completedAt || t.status !== 'done') return false;
      const completedDate = new Date(t.completedAt);
      return completedDate >= weekStart && completedDate <= weekEnd;
    });

    const createdThisWeek = tasks.filter(t => {
      const createdDate = new Date(t.createdAt);
      return createdDate >= weekStart && createdDate <= weekEnd;
    });

    // Get daily stats
    const weekDailyStats = dailyStats.filter(stat => {
      const statDate = new Date(stat.date);
      return statDate >= weekStart && statDate <= weekEnd;
    });

    const avgTasksPerDay = completedThisWeek.length / 7;
    const openTasks = tasks.filter(t => t.status !== 'done').length;

    // Status distribution
    const statusDistribution = completedThisWeek.reduce((acc, task) => {
      const status = task.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Priority distribution
    const priorityDistribution = completedThisWeek.reduce((acc, task) => {
      const priority = task.priority;
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      weekStart: weekStart.toLocaleDateString('pt-BR'),
      weekEnd: weekEnd.toLocaleDateString('pt-BR'),
      completedTasks: completedThisWeek.length,
      createdTasks: createdThisWeek.length,
      openTasks,
      avgTasksPerDay: Math.round(avgTasksPerDay * 10) / 10,
      statusDistribution,
      priorityDistribution,
      weekDailyStats,
    };
  }, [tasks, dailyStats]);

  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const stat = weekStats.weekDailyStats.find(s => s.date === dateStr);
    return {
      day: dayLabels[i],
      date: dateStr,
      tasksCompleted: stat?.tasksCompleted || 0,
    };
  });

  const maxTasks = Math.max(...dailyData.map(d => d.tasksCompleted), 1);

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Relatório Semanal</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Week Range */}
        <View style={[styles.weekRange, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.weekRangeText, { color: colors.muted }]}>
            {weekStats.weekStart} até {weekStats.weekEnd}
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: colors.primary + '15' }]}>
            <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
            <Text style={[styles.metricValue, { color: colors.foreground }]}>
              {weekStats.completedTasks}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.muted }]}>Tarefas Concluídas</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.warning + '15' }]}>
            <IconSymbol name="plus.circle.fill" size={24} color={colors.warning} />
            <Text style={[styles.metricValue, { color: colors.foreground }]}>
              {weekStats.createdTasks}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.muted }]}>Tarefas Criadas</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.primary + '15' }]}>
            <IconSymbol name="checklist" size={24} color={colors.primary} />
            <Text style={[styles.metricValue, { color: colors.foreground }]}>
              {weekStats.openTasks}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.muted }]}>Tarefas Abertas</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.success + '15' }]}>
            <IconSymbol name="chart.bar.fill" size={24} color={colors.success} />
            <Text style={[styles.metricValue, { color: colors.foreground }]}>
              {weekStats.avgTasksPerDay}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.muted }]}>Média/Dia</Text>
          </View>
        </View>

        {/* Daily Breakdown */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tarefas por Dia</Text>
          <View style={styles.dailyChart}>
            {dailyData.map((day, index) => (
              <View key={index} style={styles.dailyBar}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        backgroundColor: colors.primary,
                        height: maxTasks > 0 ? (day.tasksCompleted / maxTasks) * 80 : 0,
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.dayLabel, { color: colors.muted }]}>{day.day}</Text>
                <Text style={[styles.barValue, { color: colors.foreground }]}>{day.tasksCompleted}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Priority Distribution */}
        {Object.keys(weekStats.priorityDistribution).length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tarefas por Prioridade</Text>
            {Object.entries(weekStats.priorityDistribution).map(([priority, count]) => (
              <View key={priority} style={styles.distributionRow}>
                <View style={styles.distributionLabel}>
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: PRIORITY_CONFIG[priority as Priority].color }
                    ]}
                  />
                  <Text style={[styles.distributionText, { color: colors.foreground }]}>
                    {PRIORITY_CONFIG[priority as Priority].label}
                  </Text>
                </View>
                <Text style={[styles.distributionValue, { color: colors.muted }]}>
                  {count} ({Math.round((count / weekStats.completedTasks) * 100)}%)
                </Text>
              </View>
            ))}
          </View>
        )}

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
  weekRange: {
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  weekRangeText: {
    fontSize: 13,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    margin: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  metricLabel: {
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
  dailyChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
  },
  dailyBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    width: 24,
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  barValue: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  distributionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  distributionText: {
    fontSize: 14,
  },
  distributionValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
