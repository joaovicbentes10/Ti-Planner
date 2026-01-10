import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TextInput, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTaskContext } from '@/lib/task-context';
import { 
  Priority, TaskStatus, PRIORITY_CONFIG, STATUS_CONFIG, 
  PREDEFINED_TAGS, createSubtask 
} from '@/lib/types';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddTaskScreen() {
  const colors = useColors();
  const router = useRouter();
  const { addTask, projects, addProject } = useTaskContext();

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
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      alert('Por favor, digite um título para a tarefa');
      return;
    }

    if (!projectId) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      alert('Por favor, selecione um projeto para a tarefa');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    await addTask({
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

    router.back();
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, createSubtask(newSubtask.trim())]);
    setNewSubtask('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
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
    <ScreenContainer edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 100}
      >
        {/* Header */}
        <View style={[styles.header, { zIndex: 100 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="xmark" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Nova Tarefa</Text>
          <TouchableOpacity 
            onPress={handleSave}
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Título *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Digite o título da tarefa"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Descrição</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Descreva a tarefa..."
              placeholderTextColor={colors.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Project */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Projeto *</Text>
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
                <>
                  <IconSymbol name="folder.fill" size={18} color={colors.muted} />
                  <Text style={[styles.selectorText, { color: colors.muted }]}>
                    Selecionar projeto
                  </Text>
                </>
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
          </View>

          {/* Priority */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Prioridade</Text>
            <View style={styles.optionsRow}>
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.optionChip,
                    { 
                      backgroundColor: priority === p ? PRIORITY_CONFIG[p].color : colors.surface,
                      borderColor: priority === p ? PRIORITY_CONFIG[p].color : colors.border,
                    }
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[
                    styles.optionChipText,
                    { color: priority === p ? '#fff' : colors.foreground }
                  ]}>
                    {PRIORITY_CONFIG[p].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Status */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Status</Text>
            <View style={styles.optionsRow}>
              {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.optionChip,
                    { 
                      backgroundColor: status === s ? STATUS_CONFIG[s].color : colors.surface,
                      borderColor: status === s ? STATUS_CONFIG[s].color : colors.border,
                    }
                  ]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={[
                    styles.optionChipText,
                    { color: status === s ? '#fff' : colors.foreground }
                  ]}>
                    {STATUS_CONFIG[s].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Due Date & Estimated Hours */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.muted }]}>Data de Vencimento</Text>
              <TouchableOpacity
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[{ color: dueDate ? colors.foreground : colors.muted }]}>
                  {dueDate ? new Date(dueDate).toLocaleDateString('pt-BR') : 'Selecionar data'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate ? new Date(dueDate) : new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(event: any, selectedDate: any) => {
                    if (selectedDate) {
                      const dateString = selectedDate.toISOString().split('T')[0];
                      setDueDate(dateString);
                    }
                    setShowDatePicker(false);
                  }}
                />
              )}
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.muted }]}>Estimativa (h)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Ex: 2.5"
                placeholderTextColor={colors.muted}
                value={estimatedHours}
                onChangeText={setEstimatedHours}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Tags */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Tags</Text>
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
          </View>

          {/* Subtasks */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Subtarefas</Text>
            {subtasks.map(subtask => (
              <View 
                key={subtask.id} 
                style={[styles.subtaskItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <IconSymbol name="circle" size={16} color={colors.muted} />
                <Text style={[styles.subtaskText, { color: colors.foreground }]}>{subtask.title}</Text>
                <TouchableOpacity onPress={() => handleRemoveSubtask(subtask.id)}>
                  <IconSymbol name="xmark" size={16} color={colors.muted} />
                </TouchableOpacity>
              </View>
            ))}
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
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.muted }]}>Notas Técnicas</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground, minHeight: 100 }]}
              placeholder="Comandos, snippets, links, observações..."
              placeholderTextColor={colors.muted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 60,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
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
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
});
