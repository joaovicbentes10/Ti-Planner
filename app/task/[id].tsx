import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TextInput, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTaskContext } from '@/lib/task-context';
import { TaskComments } from '@/components/task-comments';
import { QuickEditSelector } from '@/components/quick-edit-selector';
import { 
  Task, Priority, TaskStatus, PRIORITY_CONFIG, STATUS_CONFIG, 
  PREDEFINED_TAGS, createSubtask 
} from '@/lib/types';
import * as Haptics from 'expo-haptics';

export default function TaskDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, projects, updateTask, deleteTask, addProject, addComment } = useTaskContext();

  const task = tasks.find(t => t.id === id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string | undefined>();
  const [priority, setPriority] = useState<Priority>('none');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [notes, setNotes] = useState('');
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  const [showStatusSelector, setShowStatusSelector] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setProjectId(task.projectId);
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate || '');
      setEstimatedHours(task.estimatedHours?.toString() || '');
      setSelectedTags(task.tags);
      setSubtasks(task.subtasks);
      setNotes(task.notes || '');
    }
  }, [task]);

  if (!task) {
    return (
      <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.muted }]}>Tarefa não encontrada</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backLink, { color: colors.primary }]}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const handleSave = async () => {
    if (!title.trim()) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    await updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      projectId,
      priority,
      status,
      dueDate: dueDate || undefined,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      tags: selectedTags,
      subtasks,
      notes: notes.trim() || undefined,
    });

    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Tarefa',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            await deleteTask(task.id);
            router.back();
          }
        },
      ]
    );
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, createSubtask(newSubtask.trim())]);
    setNewSubtask('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    ));
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter(s => s.id !== subtaskId));
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    const project = await addProject({ name: newProjectName.trim() });
    setProjectId(project.id);
    setNewProjectName('');
    setShowProjectPicker(false);
  };

  const selectedProject = projectId ? projects.find(p => p.id === projectId) : null;

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {isEditing ? 'Editar Tarefa' : 'Detalhes'}
          </Text>
          <View style={styles.headerActions}>
            {isEditing ? (
              <TouchableOpacity 
                onPress={handleSave}
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerButton}>
                  <IconSymbol name="pencil" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                  <IconSymbol name="trash" size={20} color={colors.error} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Título</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                value={title}
                onChangeText={setTitle}
              />
            ) : (
              <Text style={[styles.valueText, { color: colors.foreground }]}>{title}</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Descrição</Text>
            {isEditing ? (
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            ) : (
              <Text style={[styles.valueText, { color: description ? colors.foreground : colors.muted }]}>
                {description || 'Sem descrição'}
              </Text>
            )}
          </View>

          {/* Project */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Projeto</Text>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={[styles.selector, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setShowProjectPicker(!showProjectPicker)}
                >
                  {selectedProject ? (
                    <>
                      <View style={[styles.projectDot, { backgroundColor: selectedProject.color }]} />
                      <Text style={[styles.selectorText, { color: colors.foreground }]}>
                        {selectedProject.name}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.selectorText, { color: colors.muted }]}>
                      Sem projeto
                    </Text>
                  )}
                  <IconSymbol name="chevron.down" size={18} color={colors.muted} />
                </TouchableOpacity>

                {showProjectPicker && (
                  <View style={[styles.pickerDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TouchableOpacity
                      style={styles.pickerOption}
                      onPress={() => {
                        setProjectId(undefined);
                        setShowProjectPicker(false);
                      }}
                    >
                      <Text style={[styles.pickerOptionText, { color: colors.muted }]}>Sem projeto</Text>
                    </TouchableOpacity>
                    {projects.map(project => (
                      <TouchableOpacity
                        key={project.id}
                        style={styles.pickerOption}
                        onPress={() => {
                          setProjectId(project.id);
                          setShowProjectPicker(false);
                        }}
                      >
                        <View style={[styles.projectDot, { backgroundColor: project.color }]} />
                        <Text style={[styles.pickerOptionText, { color: colors.foreground }]}>
                          {project.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <View style={[styles.newProjectRow, { borderTopColor: colors.border }]}>
                      <TextInput
                        style={[styles.newProjectInput, { color: colors.foreground }]}
                        placeholder="Novo projeto..."
                        placeholderTextColor={colors.muted}
                        value={newProjectName}
                        onChangeText={setNewProjectName}
                        onSubmitEditing={handleCreateProject}
                        returnKeyType="done"
                      />
                      <TouchableOpacity onPress={handleCreateProject}>
                        <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            ) : (
              selectedProject ? (
                <View style={styles.projectBadge}>
                  <View style={[styles.projectDot, { backgroundColor: selectedProject.color }]} />
                  <Text style={[styles.valueText, { color: colors.foreground }]}>{selectedProject.name}</Text>
                </View>
              ) : (
                <Text style={[styles.valueText, { color: colors.muted }]}>Sem projeto</Text>
              )
            )}
          </View>

          {/* Priority & Status */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.muted }]}>Prioridade</Text>
              {isEditing ? (
                <View style={styles.optionsRow}>
                  {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(p => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.optionChipSmall,
                        { 
                          backgroundColor: priority === p ? PRIORITY_CONFIG[p].color : colors.surface,
                          borderColor: priority === p ? PRIORITY_CONFIG[p].color : colors.border,
                        }
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <Text style={[
                        styles.optionChipTextSmall,
                        { color: priority === p ? '#fff' : colors.foreground }
                      ]}>
                        {PRIORITY_CONFIG[p].label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.badge, { backgroundColor: PRIORITY_CONFIG[priority].color + '20' }]}
                  onPress={() => setShowPrioritySelector(true)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.badgeDot, { backgroundColor: PRIORITY_CONFIG[priority].color }]} />
                  <Text style={[styles.badgeText, { color: PRIORITY_CONFIG[priority].color }]}>
                    {PRIORITY_CONFIG[priority].label}
                  </Text>
                  <IconSymbol name="chevron.down" size={14} color={PRIORITY_CONFIG[priority].color} />
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.muted }]}>Status</Text>
              {isEditing ? (
                <View style={styles.optionsRow}>
                  {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.optionChipSmall,
                        { 
                          backgroundColor: status === s ? STATUS_CONFIG[s].color : colors.surface,
                          borderColor: status === s ? STATUS_CONFIG[s].color : colors.border,
                        }
                      ]}
                      onPress={() => setStatus(s)}
                    >
                      <Text style={[
                        styles.optionChipTextSmall,
                        { color: status === s ? '#fff' : colors.foreground }
                      ]}>
                        {STATUS_CONFIG[s].label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.badge, { backgroundColor: STATUS_CONFIG[status].color + '20' }]}
                  onPress={() => setShowStatusSelector(true)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.badgeDot, { backgroundColor: STATUS_CONFIG[status].color }]} />
                  <Text style={[styles.badgeText, { color: STATUS_CONFIG[status].color }]}>
                    {STATUS_CONFIG[status].label}
                  </Text>
                  <IconSymbol name="chevron.down" size={14} color={STATUS_CONFIG[status].color} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Due Date & Estimated Hours */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.muted }]}>Vencimento</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor={colors.muted}
                  value={dueDate}
                  onChangeText={setDueDate}
                />
              ) : (
                <Text style={[styles.valueText, { color: dueDate ? colors.foreground : colors.muted }]}>
                  {dueDate ? new Date(dueDate).toLocaleDateString('pt-BR') : 'Não definido'}
                </Text>
              )}
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.muted }]}>Estimativa</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="Horas"
                  placeholderTextColor={colors.muted}
                  value={estimatedHours}
                  onChangeText={setEstimatedHours}
                  keyboardType="decimal-pad"
                />
              ) : (
                <Text style={[styles.valueText, { color: estimatedHours ? colors.foreground : colors.muted }]}>
                  {estimatedHours ? `${estimatedHours}h` : 'Não definido'}
                </Text>
              )}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Tags</Text>
            {isEditing ? (
              <View style={styles.tagsContainer}>
                {PREDEFINED_TAGS.map(tag => (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.tagChip,
                      { 
                        backgroundColor: selectedTags.includes(tag.label) ? tag.color : colors.surface,
                        borderColor: selectedTags.includes(tag.label) ? tag.color : colors.border,
                      }
                    ]}
                    onPress={() => toggleTag(tag.label)}
                  >
                    <Text style={[
                      styles.tagChipText,
                      { color: selectedTags.includes(tag.label) ? '#fff' : colors.foreground }
                    ]}>
                      {tag.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              selectedTags.length > 0 ? (
                <View style={styles.tagsContainer}>
                  {selectedTags.map((tag, index) => {
                    const tagConfig = PREDEFINED_TAGS.find(t => t.label === tag);
                    return (
                      <View 
                        key={index} 
                        style={[styles.tagChip, { backgroundColor: (tagConfig?.color || colors.primary) + '20', borderColor: 'transparent' }]}
                      >
                        <Text style={[styles.tagChipText, { color: tagConfig?.color || colors.primary }]}>
                          {tag}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={[styles.valueText, { color: colors.muted }]}>Nenhuma tag</Text>
              )
            )}
          </View>

          {/* Subtasks */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>
              Subtarefas ({subtasks.filter(s => s.completed).length}/{subtasks.length})
            </Text>
            {subtasks.map(subtask => (
              <TouchableOpacity
                key={subtask.id} 
                style={[styles.subtaskItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => isEditing && handleToggleSubtask(subtask.id)}
                disabled={!isEditing}
              >
                <IconSymbol 
                  name={subtask.completed ? "checkmark.circle.fill" : "circle"} 
                  size={20} 
                  color={subtask.completed ? colors.success : colors.muted} 
                />
                <Text style={[
                  styles.subtaskText, 
                  { color: colors.foreground },
                  subtask.completed && { textDecorationLine: 'line-through', color: colors.muted }
                ]}>
                  {subtask.title}
                </Text>
                {isEditing && (
                  <TouchableOpacity onPress={() => handleRemoveSubtask(subtask.id)}>
                    <IconSymbol name="xmark" size={16} color={colors.muted} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
            {isEditing && (
              <View style={[styles.addSubtaskRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.addSubtaskInput, { color: colors.foreground }]}
                  placeholder="Adicionar subtarefa..."
                  placeholderTextColor={colors.muted}
                  value={newSubtask}
                  onChangeText={setNewSubtask}
                  onSubmitEditing={handleAddSubtask}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={handleAddSubtask}>
                  <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Notas Técnicas</Text>
            {isEditing ? (
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground, minHeight: 100 }]}
                placeholder="Comandos, snippets, links..."
                placeholderTextColor={colors.muted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            ) : (
              <Text style={[styles.valueText, { color: notes ? colors.foreground : colors.muted }]}>
                {notes || 'Sem notas'}
              </Text>
            )}
          </View>

          {/* Comments */}
          {!isEditing && (
            <TaskComments
              comments={task.comments}
              onAddComment={(text) => addComment(task.id, text)}
            />
          )}

          {/* Metadata */}
          <View style={[styles.metadata, { borderTopColor: colors.border }]}>
            <Text style={[styles.metadataText, { color: colors.muted }]}>
              Criado em {new Date(task.createdAt).toLocaleDateString('pt-BR')}
            </Text>
            {task.completedAt && (
              <Text style={[styles.metadataText, { color: colors.muted }]}>
                Concluído em {new Date(task.completedAt).toLocaleDateString('pt-BR')}
              </Text>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Quick Edit Selectors */}
      <QuickEditSelector
        visible={showPrioritySelector}
        type="priority"
        currentValue={priority}
        onSelect={(value) => {
          setPriority(value as Priority);
          handleSave();
        }}
        onClose={() => setShowPrioritySelector(false)}
      />

      <QuickEditSelector
        visible={showStatusSelector}
        type="status"
        currentValue={status}
        onSelect={(value) => {
          setStatus(value as TaskStatus);
          handleSave();
        }}
        onClose={() => setShowStatusSelector(false)}
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
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
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
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  valueText: {
    fontSize: 15,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 80,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  selectorText: {
    flex: 1,
    fontSize: 15,
  },
  projectDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  projectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerDropdown: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 8,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  pickerOptionText: {
    fontSize: 14,
  },
  newProjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  newProjectInput: {
    flex: 1,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionChipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  optionChipTextSmall: {
    fontSize: 11,
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
  },
  subtaskText: {
    flex: 1,
    fontSize: 14,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 10,
  },
  addSubtaskInput: {
    flex: 1,
    fontSize: 14,
  },
  metadata: {
    paddingTop: 16,
    borderTopWidth: 1,
    marginTop: 8,
  },
  metadataText: {
    fontSize: 12,
    marginBottom: 4,
  },
});
