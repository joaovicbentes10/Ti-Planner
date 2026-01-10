import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Task, Project, PRIORITY_CONFIG, STATUS_CONFIG } from '@/lib/types';
import { IconSymbol } from './ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface TaskCardProps {
  task: Task;
  project?: Project;
  onPress?: () => void;
  onToggle?: () => void;
  onStatusChange?: (status: any) => void;
  compact?: boolean;
}

export function TaskCard({ task, project, onPress, onToggle, onStatusChange, compact = false }: TaskCardProps) {
  const colors = useColors();
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const statusConfig = STATUS_CONFIG[task.status];
  const isCompleted = task.status === 'done';

  const handleToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle?.();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã';
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;
  const dueDateText = formatDate(task.dueDate);

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.8 : 1,
        },
        isCompleted && styles.completedContainer,
      ]}
    >
      {/* Checkbox */}
      <Pressable
        onPress={handleToggle}
        style={({ pressed }) => [
          styles.checkbox,
          { 
            borderColor: isCompleted ? colors.success : colors.border,
            backgroundColor: isCompleted ? colors.success : 'transparent',
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        {isCompleted && (
          <IconSymbol name="checkmark" size={14} color="#fff" />
        )}
      </Pressable>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              { color: colors.foreground },
              isCompleted && { textDecorationLine: 'line-through', color: colors.muted },
            ]}
            numberOfLines={compact ? 1 : 2}
          >
            {task.title}
          </Text>
          
          {/* Priority indicator */}
          {task.priority !== 'none' && (
            <View style={[styles.priorityDot, { backgroundColor: priorityConfig.color }]} />
          )}
        </View>

        {/* Meta info row */}
        <View style={styles.metaRow}>
          {/* Project badge */}
          {project && (
            <View style={[styles.projectBadge, { backgroundColor: project.color + '20' }]}>
              <View style={[styles.projectDot, { backgroundColor: project.color }]} />
              <Text style={[styles.projectText, { color: project.color }]} numberOfLines={1}>
                {project.name}
              </Text>
            </View>
          )}

          {/* Due date */}
          {dueDateText && (
            <View style={styles.dueDateContainer}>
              <IconSymbol 
                name="clock.fill" 
                size={12} 
                color={isOverdue ? colors.error : colors.muted} 
              />
              <Text style={[
                styles.dueDateText, 
                { color: isOverdue ? colors.error : colors.muted }
              ]}>
                {dueDateText}
              </Text>
            </View>
          )}

          {/* Subtasks count */}
          {totalSubtasks > 0 && (
            <View style={styles.subtasksContainer}>
              <IconSymbol name="checklist" size={12} color={colors.muted} />
              <Text style={[styles.subtasksText, { color: colors.muted }]}>
                {completedSubtasks}/{totalSubtasks}
              </Text>
            </View>
          )}
        </View>

        {/* Tags */}
        {!compact && task.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {task.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
              </View>
            ))}
            {task.tags.length > 3 && (
              <Text style={[styles.moreTagsText, { color: colors.muted }]}>
                +{task.tags.length - 3}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Chevron */}
      <IconSymbol name="chevron.right" size={16} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  completedContainer: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  projectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  projectDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  projectText: {
    fontSize: 11,
    fontWeight: '500',
    maxWidth: 80,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dueDateText: {
    fontSize: 11,
  },
  subtasksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  subtasksText: {
    fontSize: 11,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 10,
  },
});
