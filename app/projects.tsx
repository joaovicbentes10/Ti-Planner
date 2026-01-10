import React, { useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, TextInput, 
  StyleSheet, Alert, Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { EmptyState } from '@/components/empty-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTaskContext } from '@/lib/task-context';
import { Project, PROJECT_COLORS } from '@/lib/types';
import { ColorPicker, CORPORATE_COLORS } from '@/components/color-picker';

export default function ProjectsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { projects, tasks, addProject, updateProject, deleteProject } = useTaskContext();

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(CORPORATE_COLORS[0].hex);

  const openCreateModal = () => {
    setEditingProject(null);
    setProjectName('');
    setProjectDescription('');
    setSelectedColor(CORPORATE_COLORS[Math.floor(Math.random() * CORPORATE_COLORS.length)].hex);
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setProjectName(project.name);
    setProjectDescription(project.description || '');
    setSelectedColor(project.color);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!projectName.trim()) return;

    if (editingProject) {
      await updateProject(editingProject.id, {
        name: projectName.trim(),
        description: projectDescription.trim() || undefined,
        color: selectedColor,
      });
    } else {
      await addProject({
        name: projectName.trim(),
        description: projectDescription.trim() || undefined,
        color: selectedColor,
      });
    }

    setShowModal(false);
  };

  const handleDelete = (project: Project) => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    
    Alert.alert(
      'Excluir Projeto',
      projectTasks.length > 0
        ? `Este projeto tem ${projectTasks.length} tarefa(s). As tarefas não serão excluídas, apenas desvinculadas do projeto.`
        : 'Tem certeza que deseja excluir este projeto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => deleteProject(project.id)
        },
      ]
    );
  };

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const completed = projectTasks.filter(t => t.status === 'done').length;
    return { total: projectTasks.length, completed };
  };

  const renderProject = ({ item }: { item: Project }) => {
    const stats = getProjectStats(item.id);
    const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    return (
      <TouchableOpacity
        style={[styles.projectCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => router.push(`/project/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.projectHeader}>
          <View style={[styles.projectColor, { backgroundColor: item.color }]} />
          <View style={styles.projectInfo}>
            <Text style={[styles.projectName, { color: colors.foreground }]}>{item.name}</Text>
            {item.description && (
              <Text style={[styles.projectDescription, { color: colors.muted }]} numberOfLines={1}>
                {item.description}
              </Text>
            )}
          </View>
          <View style={styles.projectActions}>
            <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}>
              <IconSymbol name="pencil" size={18} color={colors.muted} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
              <IconSymbol name="trash" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.projectStats}>
          <View style={styles.statsRow}>
            <Text style={[styles.statsText, { color: colors.muted }]}>
              {stats.completed}/{stats.total} tarefas
            </Text>
            <Text style={[styles.statsText, { color: colors.muted }]}>
              {Math.round(progress)}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { backgroundColor: item.color, width: `${progress}%` }
              ]} 
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Projetos</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={openCreateModal}
        >
          <IconSymbol name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Projects List */}
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="folder.fill"
            title="Nenhum projeto ainda"
            description="Crie projetos para organizar suas tarefas por contexto ou área"
            actionLabel="Criar Projeto"
            onAction={openCreateModal}
          />
        }
      />

      {/* Create/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalHeaderButton}>
              <Text style={[styles.modalCancel, { color: colors.muted }]}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
            </Text>
            <TouchableOpacity onPress={handleSave} style={styles.modalHeaderButton}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={[{ key: 'content' }]}
            renderItem={() => (
              <View style={styles.modalContent}>
                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.muted }]}>Nome</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="Nome do projeto"
                    placeholderTextColor={colors.muted}
                    value={projectName}
                    onChangeText={setProjectName}
                    autoFocus
                  />
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.muted }]}>Descrição (opcional)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="Descrição do projeto"
                    placeholderTextColor={colors.muted}
                    value={projectDescription}
                    onChangeText={setProjectDescription}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.muted }]}>Cor do Projeto</Text>
                  <ColorPicker
                    selectedColor={selectedColor}
                    onColorSelect={setSelectedColor}
                    showLabels={true}
                  />
                </View>
              </View>
            )}
            keyExtractor={item => item.key}
            scrollEnabled={true}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        </SafeAreaView>
      </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  projectCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectColor: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  projectDescription: {
    fontSize: 13,
  },
  projectActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  projectStats: {
    gap: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsText: {
    fontSize: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalHeaderButton: {
    minWidth: 70,
    paddingVertical: 8,
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
});
