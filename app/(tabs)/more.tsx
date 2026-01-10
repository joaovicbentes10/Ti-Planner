import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTaskContext } from '@/lib/task-context';

interface MenuItemProps {
  icon: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  badge?: number;
}

function MenuItem({ icon, iconColor, title, subtitle, onPress, badge }: MenuItemProps) {
  const colors = useColors();
  
  return (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: iconColor + '15' }]}>
        <IconSymbol name={icon as any} size={22} color={iconColor} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: colors.foreground }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.menuSubtitle, { color: colors.muted }]}>{subtitle}</Text>
        )}
      </View>
      {badge !== undefined && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <IconSymbol name="chevron.right" size={18} color={colors.muted} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const colors = useColors();
  const router = useRouter();
  const { projects, tasks } = useTaskContext();

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;

  return (
    <ScreenContainer>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Mais</Text>
        </View>

        {/* Quick Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{totalTasks}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Tarefas</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>{completedTasks}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Concluídas</Text>
          </View>

        </View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>ORGANIZAÇÃO</Text>
          
          <MenuItem
            icon="folder.fill"
            iconColor={colors.primary}
            title="Projetos"
            subtitle={`${projects.length} projetos`}
            onPress={() => router.push('/projects' as any)}
            badge={projects.length}
          />
          
          <MenuItem
            icon="calendar"
            iconColor="#F59E0B"
            title="Calendário"
            subtitle="Visualizar por data"
            onPress={() => router.push('/calendar' as any)}
          />
          
          <MenuItem
            icon="chart.bar.fill"
            iconColor="#10B981"
            title="Estatísticas"
            subtitle="Visualizar métricas"
            onPress={() => router.push('/stats' as any)}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>CONFIGURAÇÕES</Text>
          
          <MenuItem
            icon="gearshape.fill"
            iconColor="#6B7280"
            title="Configurações"
            subtitle="Tema, Notificações"
            onPress={() => router.push('/settings' as any)}
          />
          
          <MenuItem
            icon="square.and.arrow.up"
            iconColor="#3B82F6"
            title="Exportar Dados"
            subtitle="Backup em JSON"
            onPress={() => router.push('/export' as any)}
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: colors.foreground }]}>IT Task Planner</Text>
          <Text style={[styles.appVersion, { color: colors.muted }]}>Versão 2.0.0</Text>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    marginVertical: 4,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
  },
  appVersion: {
    fontSize: 13,
    marginTop: 4,
  },
  appDescription: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
