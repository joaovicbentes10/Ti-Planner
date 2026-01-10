import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTaskContext } from '@/lib/task-context';
import { Task, TaskStatus, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/types';

const COLUMN_WIDTH = Dimensions.get('window').width * 0.75;

const KANBAN_COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'todo', title: 'A Fazer' },
  { status: 'in_progress', title: 'Em Progresso' },
  { status: 'review', title: 'Revisão' },
  { status: 'done', title: 'Concluído' },
];

export default function KanbanScreen() {
  const colors = useColors();
  const router = useRouter();
  const { tasks, projects, updateTask, selectedProjectId, setSelectedProject } = useTaskContext();
  
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  const filteredTasks = useMemo(() => {
    if (!selectedProjectId) return tasks;
    return tasks.filter(t => t.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks
      .filter(t => t.status === status)
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  };

  const getProject = (projectId?: string) => {
    if (!projectId) return undefined;
    return projects.find(p => p.id === projectId);
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Kanban</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/add-task' as any)}
          activeOpacity={0.8}
        >
          <IconSymbol name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Project Filter */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.projectFilter, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowProjectPicker(!showProjectPicker)}
          activeOpacity={0.7}
        >
          {selectedProject ? (
            <>
              <View style={[styles.projectDot, { backgroundColor: selectedProject.color }]} />
              <Text style={[styles.projectFilterText, { color: colors.foreground }]} numberOfLines={1}>
                {selectedProject.name}
              </Text>
            </>
          ) : (
            <>
              <IconSymbol name="folder.fill" size={16} color={colors.muted} />
              <Text style={[styles.projectFilterText, { color: colors.muted }]}>
                Todos os projetos
              </Text>
            </>
          )}
          <IconSymbol name="chevron.down" size={16} color={colors.muted} />
        </TouchableOpacity>

        {selectedProjectId && (
          <TouchableOpacity
            style={[styles.clearFilter, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setSelectedProject(null)}
          >
            <IconSymbol name="xmark" size={14} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Project Picker Dropdown */}
      {showProjectPicker && (
        <View style={[styles.projectPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.projectOption}
            onPress={() => {
              setSelectedProject(null);
              setShowProjectPicker(false);
            }}
          >
            <IconSymbol name="folder.fill" size={16} color={colors.muted} />
            <Text style={[styles.projectOptionText, { color: colors.foreground }]}>
              Todos os projetos
            </Text>
          </TouchableOpacity>
          {projects.map(project => (
            <TouchableOpacity
              key={project.id}
              style={styles.projectOption}
              onPress={() => {
                setSelectedProject(project.id);
                setShowProjectPicker(false);
              }}
            >
              <View style={[styles.projectDot, { backgroundColor: project.color }]} />
              <Text style={[styles.projectOptionText, { color: colors.foreground }]}>
                {project.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Kanban Board */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.boardContainer}
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={COLUMN_WIDTH + 12}
      >
        {KANBAN_COLUMNS.map(column => {
          const columnTasks = getTasksByStatus(column.status);
          const statusConfig = STATUS_CONFIG[column.status];
          
          return (
            <View 
              key={column.status} 
              style={[styles.column, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              {/* Column Header */}
              <View style={styles.columnHeader}>
                <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                <Text style={[styles.columnTitle, { color: colors.foreground }]}>
                  {column.title}
                </Text>
                <View style={[styles.countBadge, { backgroundColor: colors.background }]}>
                  <Text style={[styles.countText, { color: colors.muted }]}>
                    {columnTasks.length}
                  </Text>
                </View>
              </View>

              {/* Tasks */}
              <ScrollView 
                style={styles.columnContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.columnTasksContent}
              >
                {columnTasks.length === 0 ? (
                  <View style={[styles.emptyColumn, { borderColor: colors.border }]}>
                    <Text style={[styles.emptyText, { color: colors.muted }]}>
                      Nenhuma tarefa
                    </Text>
                  </View>
                ) : (
                  columnTasks.map(task => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      project={getProject(task.projectId)}
                      onPress={() => router.push(`/task/${task.id}` as any)}
                      onMoveLeft={
                        column.status !== 'todo' 
                          ? () => {
                              const currentIndex = KANBAN_COLUMNS.findIndex(c => c.status === column.status);
                              if (currentIndex > 0) {
                                handleMoveTask(task.id, KANBAN_COLUMNS[currentIndex - 1].status);
                              }
                            }
                          : undefined
                      }
                      onMoveRight={
                        column.status !== 'done'
                          ? () => {
                              const currentIndex = KANBAN_COLUMNS.findIndex(c => c.status === column.status);
                              if (currentIndex < KANBAN_COLUMNS.length - 1) {
                                handleMoveTask(task.id, KANBAN_COLUMNS[currentIndex + 1].status);
                              }
                            }
                          : undefined
                      }
                    />
                  ))
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

interface KanbanCardProps {
  task: Task;
  project?: { name: string; color: string };
  onPress: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}

function KanbanCard({ task, project, onPress, onMoveLeft, onMoveRight }: KanbanCardProps) {
  const colors = useColors();
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { 
          backgroundColor: colors.background,
          borderColor: colors.border,
          opacity: pressed ? 0.8 : 1,
        }
      ]}
    >
      {/* Priority indicator */}
      {task.priority !== 'none' && (
        <View style={[styles.priorityBar, { backgroundColor: priorityConfig.color }]} />
      )}
      
      <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>
        {task.title}
      </Text>

      {/* Project badge */}
      {project && (
        <View style={[styles.cardProject, { backgroundColor: project.color + '20' }]}>
          <View style={[styles.cardProjectDot, { backgroundColor: project.color }]} />
          <Text style={[styles.cardProjectText, { color: project.color }]} numberOfLines={1}>
            {project.name}
          </Text>
        </View>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <View style={styles.cardTags}>
          {task.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={[styles.cardTag, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.cardTagText, { color: colors.primary }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Move buttons */}
      <View style={styles.moveButtons}>
        {onMoveLeft && (
          <TouchableOpacity 
            style={[styles.moveButton, { backgroundColor: colors.surface }]}
            onPress={onMoveLeft}
          >
            <IconSymbol name="chevron.left" size={14} color={colors.muted} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        {onMoveRight && (
          <TouchableOpacity 
            style={[styles.moveButton, { backgroundColor: colors.surface }]}
            onPress={onMoveRight}
          >
            <IconSymbol name="chevron.right" size={14} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  projectFilter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  projectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  projectFilterText: {
    flex: 1,
    fontSize: 14,
  },
  clearFilter: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectPicker: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  projectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  projectOptionText: {
    fontSize: 14,
  },
  boardContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  column: {
    width: COLUMN_WIDTH,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  columnTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
  },
  columnContent: {
    flex: 1,
    maxHeight: 500,
  },
  columnTasksContent: {
    padding: 8,
    gap: 8,
  },
  emptyColumn: {
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
  card: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  priorityBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  cardProject: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  cardProjectDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardProjectText: {
    fontSize: 11,
    fontWeight: '500',
    maxWidth: 100,
  },
  cardTags: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  cardTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moveButtons: {
    flexDirection: 'row',
    marginTop: 4,
  },
  moveButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
