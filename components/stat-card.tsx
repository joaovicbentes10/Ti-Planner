import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from './ui/icon-symbol';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconColor,
  trend,
  trendValue 
}: StatCardProps) {
  const colors = useColors();

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return colors.success;
      case 'down': return colors.error;
      default: return colors.muted;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: (iconColor || colors.primary) + '15' }]}>
            <IconSymbol name={icon as any} size={18} color={iconColor || colors.primary} />
          </View>
        )}
        <Text style={[styles.title, { color: colors.muted }]}>{title}</Text>
      </View>
      
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
        {trend && trendValue && (
          <View style={[styles.trendBadge, { backgroundColor: getTrendColor() + '15' }]}>
            <IconSymbol 
              name={trend === 'up' ? 'chevron.up' : trend === 'down' ? 'chevron.down' : 'chevron.right'} 
              size={10} 
              color={getTrendColor()} 
            />
            <Text style={[styles.trendText, { color: getTrendColor() }]}>{trendValue}</Text>
          </View>
        )}
      </View>
      
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 4,
  },
});
