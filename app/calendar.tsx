import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { TaskCard } from '@/components/task-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTaskContext } from '@/lib/task-context';
import { Task, PRIORITY_CONFIG } from '@/lib/types';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function CalendarScreen() {
  const colors = useColors();
  const router = useRouter();
  const { tasks, projects, toggleTask } = useTaskContext();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [year, month]);

  // Get tasks by date
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = task.dueDate.split('T')[0];
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(task);
      }
    });
    return map;
  }, [tasks]);

  const getDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
  };

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] || []) : [];

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
      compact
    />
  );

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Calendário</Text>
        <TouchableOpacity onPress={goToToday}>
          <Text style={[styles.todayButton, { color: colors.primary }]}>Hoje</Text>
        </TouchableOpacity>
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: colors.foreground }]}>
          {MONTHS[month]} {year}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((day, index) => (
          <View key={index} style={styles.weekdayCell}>
            <Text style={[styles.weekdayText, { color: colors.muted }]}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const dateKey = getDateKey(day);
          const dayTasks = tasksByDate[dateKey] || [];
          const isSelected = selectedDate === dateKey;
          const today = isToday(day);

          // Get priority colors for indicators
          const priorityColors = dayTasks
            .filter(t => t.status !== 'done')
            .slice(0, 3)
            .map(t => PRIORITY_CONFIG[t.priority].color);

          return (
            <TouchableOpacity
              key={dateKey}
              style={[
                styles.dayCell,
                isSelected && { backgroundColor: colors.primary },
                today && !isSelected && { backgroundColor: colors.primary + '20' },
              ]}
              onPress={() => setSelectedDate(dateKey)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.dayText,
                { color: colors.foreground },
                isSelected && { color: '#fff' },
                today && !isSelected && { color: colors.primary, fontWeight: '700' },
              ]}>
                {day}
              </Text>
              
              {/* Task indicators */}
              {priorityColors.length > 0 && (
                <View style={styles.indicators}>
                  {priorityColors.map((color, i) => (
                    <View 
                      key={i} 
                      style={[
                        styles.indicator, 
                        { backgroundColor: isSelected ? '#fff' : color }
                      ]} 
                    />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Date Tasks */}
      <View style={[styles.tasksSection, { borderTopColor: colors.border }]}>
        <View style={styles.tasksSectionHeader}>
          <Text style={[styles.tasksSectionTitle, { color: colors.foreground }]}>
            {selectedDate 
              ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })
              : 'Selecione uma data'
            }
          </Text>
          {selectedDate && (
            <TouchableOpacity 
              onPress={() => router.push('/add-task' as any)}
              style={[styles.addTaskButton, { backgroundColor: colors.primary }]}
            >
              <IconSymbol name="plus" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {selectedDate ? (
          selectedTasks.length > 0 ? (
            <FlatList
              data={selectedTasks}
              renderItem={renderTask}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.tasksList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noTasks}>
              <Text style={[styles.noTasksText, { color: colors.muted }]}>
                Nenhuma tarefa para esta data
              </Text>
            </View>
          )
        ) : (
          <View style={styles.noTasks}>
            <Text style={[styles.noTasksText, { color: colors.muted }]}>
              Toque em uma data para ver as tarefas
            </Text>
          </View>
        )}
      </View>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  todayButton: {
    fontSize: 15,
    fontWeight: '600',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekdaysRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  weekdayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 4,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  indicators: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tasksSection: {
    flex: 1,
    marginTop: 16,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  tasksSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tasksSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  addTaskButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksList: {
    paddingHorizontal: 16,
  },
  noTasks: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  noTasksText: {
    fontSize: 14,
  },
});
