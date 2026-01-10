import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Modal } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { TaskStatus, STATUS_CONFIG } from '@/lib/types';

interface QuickStatusMenuProps {
  visible: boolean;
  currentStatus: TaskStatus;
  onStatusSelect: (status: TaskStatus) => void;
  onClose: () => void;
}

const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'review', 'done', 'blocked'];

export function QuickStatusMenu({
  visible,
  currentStatus,
  onStatusSelect,
  onClose,
}: QuickStatusMenuProps) {
  const colors = useColors();

  const handleStatusSelect = (status: TaskStatus) => {
    onStatusSelect(status);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.menuTitle, { color: colors.muted }]}>Mudar Status</Text>
          
          {STATUS_ORDER.map((status) => {
            const isSelected = status === currentStatus;
            const config = STATUS_CONFIG[status];
            
            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  isSelected && [styles.selectedOption, { backgroundColor: colors.primary + '15' }],
                  { borderBottomColor: colors.border }
                ]}
                onPress={() => handleStatusSelect(status)}
                activeOpacity={0.7}
              >
                <View style={[styles.statusDot, { backgroundColor: config.color }]} />
                <Text style={[
                  styles.statusText,
                  { color: colors.foreground },
                  isSelected && { fontWeight: '600' }
                ]}>
                  {config.label}
                </Text>
                {isSelected && (
                  <IconSymbol name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  menu: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  selectedOption: {
    borderRadius: 10,
    borderBottomWidth: 0,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    flex: 1,
    fontSize: 15,
  },
});
