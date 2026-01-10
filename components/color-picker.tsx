import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

// Cores corporativas profissionais
export const CORPORATE_COLORS = [
  { name: 'Azul Profissional', hex: '#0066CC' },
  { name: 'Cinza Neutro', hex: '#4A5568' },
  { name: 'Verde Sucesso', hex: '#059669' },
  { name: 'Laranja Atenção', hex: '#D97706' },
  { name: 'Vermelho Crítico', hex: '#DC2626' },
  { name: 'Roxo Inovação', hex: '#7C3AED' },
  { name: 'Azul Ciano', hex: '#0891B2' },
  { name: 'Índigo', hex: '#4F46E5' },
];

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  showLabels?: boolean;
}

export function ColorPicker({ selectedColor, onColorSelect, showLabels = false }: ColorPickerProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {CORPORATE_COLORS.map((color) => (
          <TouchableOpacity
            key={color.hex}
            style={[
              styles.colorButton,
              { backgroundColor: color.hex },
              selectedColor === color.hex && [
                styles.selectedColor,
                { borderColor: colors.foreground }
              ]
            ]}
            onPress={() => onColorSelect(color.hex)}
            activeOpacity={0.8}
          >
            {selectedColor === color.hex && (
              <IconSymbol name="checkmark" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {showLabels && selectedColor && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.muted }]}>
            {CORPORATE_COLORS.find(c => c.hex === selectedColor)?.name || 'Cor customizada'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  colorButton: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderWidth: 3,
  },
  labelContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});
