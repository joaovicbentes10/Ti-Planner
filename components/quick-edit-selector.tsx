import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { Priority, TaskStatus, PRIORITY_CONFIG, STATUS_CONFIG } from '@/lib/types';

interface QuickEditSelectorProps {
  visible: boolean;
  type: 'priority' | 'status';
  currentValue: Priority | TaskStatus;
  onSelect: (value: Priority | TaskStatus) => void;
  onClose: () => void;
}

export function QuickEditSelector({ 
  visible, 
  type, 
  currentValue, 
  onSelect, 
  onClose 
}: QuickEditSelectorProps) {
  const colors = useColors();

  const options = type === 'priority' 
    ? Object.entries(PRIORITY_CONFIG)
    : Object.entries(STATUS_CONFIG);

  const handleSelect = (value: string) => {
    onSelect(value as Priority | TaskStatus);
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
        <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {type === 'priority' ? 'Selecionar Prioridade' : 'Selecionar Status'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="xmark" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            {options.map(([key, config]) => {
              const isSelected = key === currentValue;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.option,
                    { 
                      backgroundColor: isSelected ? colors.surface : 'transparent',
                      borderColor: isSelected ? colors.primary : colors.border 
                    }
                  ]}
                  onPress={() => handleSelect(key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.indicator, { backgroundColor: config.color }]} />
                  <Text style={[styles.optionLabel, { color: colors.foreground }]}>
                    {config.label}
                  </Text>
                  {isSelected && (
                    <IconSymbol name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  options: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
});
