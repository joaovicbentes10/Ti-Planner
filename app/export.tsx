import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTaskContext } from '@/lib/task-context';
import * as store from '@/lib/store';
import * as Haptics from 'expo-haptics';

export default function ExportScreen() {
  const colors = useColors();
  const router = useRouter();
  const { tasks, projects, pomodoroSessions } = useTaskContext();
  
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await store.exportAllData();
      await Clipboard.setStringAsync(data);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert(
        'Exportação Concluída',
        'Os dados foram copiados para a área de transferência. Cole em um arquivo JSON para backup.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha ao exportar dados.');
    } finally {
      setExporting(false);
    }
  };

  const stats = {
    tasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'done').length,
    projects: projects.length,
    pomodoros: pomodoroSessions.filter(s => s.type === 'work').length,
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Exportar Dados</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.muted }]}>
            Exporte seus dados em formato JSON para fazer backup ou transferir para outro dispositivo.
          </Text>
        </View>

        {/* Data Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Resumo dos Dados</Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <IconSymbol name="checklist" size={20} color={colors.primary} />
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{stats.tasks}</Text>
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>Tarefas</Text>
            </View>
            <View style={styles.summaryItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{stats.completedTasks}</Text>
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>Concluídas</Text>
            </View>
            <View style={styles.summaryItem}>
              <IconSymbol name="folder.fill" size={20} color={colors.warning} />
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{stats.projects}</Text>
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>Projetos</Text>
            </View>
            <View style={styles.summaryItem}>
              <IconSymbol name="flame.fill" size={20} color={colors.error} />
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{stats.pomodoros}</Text>
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>Pomodoros</Text>
            </View>
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>OPÇÕES DE EXPORTAÇÃO</Text>
          
          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: colors.primary }]}
            onPress={handleExport}
            disabled={exporting}
            activeOpacity={0.8}
          >
            <IconSymbol name="square.and.arrow.up" size={22} color="#fff" />
            <Text style={styles.exportButtonText}>
              {exporting ? 'Exportando...' : 'Copiar JSON para Clipboard'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={[styles.instructionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.instructionsTitle, { color: colors.foreground }]}>Como usar o backup</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <Text style={[styles.instructionNumber, { color: colors.primary }]}>1</Text>
              <Text style={[styles.instructionText, { color: colors.muted }]}>
                Clique em "Copiar JSON para Clipboard"
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={[styles.instructionNumber, { color: colors.primary }]}>2</Text>
              <Text style={[styles.instructionText, { color: colors.muted }]}>
                Abra um editor de texto ou app de notas
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={[styles.instructionNumber, { color: colors.primary }]}>3</Text>
              <Text style={[styles.instructionText, { color: colors.muted }]}>
                Cole o conteúdo e salve como .json
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={[styles.instructionNumber, { color: colors.primary }]}>4</Text>
              <Text style={[styles.instructionText, { color: colors.muted }]}>
                Guarde o arquivo em local seguro
              </Text>
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 11,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  instructionNumber: {
    fontSize: 14,
    fontWeight: '700',
    width: 20,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
