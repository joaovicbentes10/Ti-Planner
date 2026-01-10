import { useState } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, StyleSheet, 
  Switch, TextInput, Alert, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTaskContext } from '@/lib/task-context';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { settings, updateSettings, clearAllData } = useTaskContext();

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSettings({ theme });
  };

  const handleNotificationsToggle = (value: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSettings({ notifications: value });
  };

  const handleClearData = () => {
    Alert.alert(
      'Limpar Todos os Dados',
      'Isso irá excluir todas as tarefas, projetos e histórico. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar Tudo', 
          style: 'destructive',
          onPress: () => {
            clearAllData();
            Alert.alert('Sucesso', 'Todos os dados foram excluídos.');
          }
        },
      ]
    );
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Configurações</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>APARÊNCIA</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.themeOptions}>
              {(['light', 'dark', 'system'] as const).map(theme => (
                <TouchableOpacity
                  key={theme}
                  style={[
                    styles.themeOption,
                    { 
                      backgroundColor: settings.theme === theme ? colors.primary : colors.background,
                      borderColor: settings.theme === theme ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => handleThemeChange(theme)}
                >
                  <IconSymbol 
                    name={theme === 'light' ? 'sun.max.fill' : theme === 'dark' ? 'moon.fill' : 'gear'} 
                    size={20} 
                    color={settings.theme === theme ? '#fff' : colors.foreground} 
                  />
                  <Text style={[
                    styles.themeOptionText,
                    { color: settings.theme === theme ? '#fff' : colors.foreground }
                  ]}>
                    {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Sistema'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>NOTIFICAÇÕES</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>Notificações</Text>
                <Text style={[styles.settingDescription, { color: colors.muted }]}>
                  Receber lembretes de tarefas
                </Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>DADOS</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.dangerButton, { backgroundColor: colors.error }]}
              onPress={handleClearData}
              activeOpacity={0.8}
            >
              <Text style={styles.dangerButtonText}>Limpar Todos os Dados</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: colors.foreground }]}>TI Planner</Text>
          <Text style={[styles.appVersion, { color: colors.muted }]}>Versão 2.6.3</Text>
          <Text style={[styles.appDescription, { color: colors.muted }]}>
            Gerenciamento de tarefas para profissionais de TI
          </Text>
        </View>

        <View style={{ height: 20 }} />
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
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  themeOptions: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 8,
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
  },
  dangerButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 12,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 13,
    textAlign: 'center',
  },
});
